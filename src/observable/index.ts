import { EventEmitter } from "events";
import { promisify } from "util";
import { FifoBuffer } from "../buffers/fifo.buffer";

import { OperatorFunction } from "../types";
import { pipeFromArray } from "../utils";

export class Observable<T> {
  protected innerError: any | undefined = undefined;
  protected throwError: (error: any) => void;
  protected readonly emitter = new EventEmitter();
  test = undefined;
  protected readonly factory: (
    throwError: (error: any) => void
  ) => AsyncGenerator<T, void, void>;
  constructor(
    factory: (throwError: (error: any) => void) => AsyncGenerator<T, void, void>
  ) {
    this.factory = factory;
    this.throwError = (error: any) => {
      this.innerError = error;
    };
  }

  pipe(): Observable<T>;
  pipe<A>(op1: OperatorFunction<T, A>): Observable<A>;
  pipe<A, B>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>
  ): Observable<B>;
  pipe<A, B, C>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>
  ): Observable<C>;
  pipe<A, B, C, D>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>
  ): Observable<D>;
  pipe<A, B, C, D, E>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>
  ): Observable<E>;
  pipe<A, B, C, D, E, F>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>
  ): Observable<F>;
  pipe<A, B, C, D, E, F, G>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>
  ): Observable<G>;
  pipe<A, B, C, D, E, F, G, H>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>
  ): Observable<H>;
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>
  ): Observable<I>;
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>,
    ...operations: OperatorFunction<any, any>[]
  ): Observable<unknown>;

  pipe(...operators: OperatorFunction<any, any>[]): Observable<any> {
    return pipeFromArray<any, any>(operators)(this);
  }
  async *subscribe() {
    const observer = new EventEmitter();
    this.emitter.once("errored", () => {
      observer.emit("errored");
    });
    const buffer = new FifoBuffer<T>(10);
    const source = this.factory(this.throwError);
    const errorPromise = new Promise<void>((resolve) =>
      observer.once("errored", () => resolve())
    );
    let runningRead = true;
    let runningWrite = true;
    let init = true;
    const runner = async () => {
      while (runningWrite) {
        if (this.innerError) {
          runningWrite = false;
          continue;
        }
        const data = await source.next();
        if (this.innerError) {
          runningWrite = false;
          observer.emit("errored");
          continue;
        }
        if (data.done) {
          if (init) {
            observer.emit("drain");
          }
          runningWrite = false;
        } else {
          const permitted = buffer.write(data.value);
          observer.emit("drain");
          if (!permitted) {
            await promisify(observer.once.bind(observer))("resume");
            buffer.write(data.value);
          }
        }
        if (init) {
          init = false;
        }
      }
    };
    runner();
    while (runningRead) {
      const data = buffer.read();
      observer.emit("resume");
      if (data) {
        yield data;
      } else {
        if (runningWrite) {
          await Promise.any([
            promisify(observer.once.bind(observer))("drain"),
            errorPromise,
          ]);
          const dataNext = buffer.read();
          if (dataNext) {
            yield dataNext;
          }
        } else {
          runningRead = false;
          if (this.innerError) {
            throw this.innerError;
          }
        }
      }
    }
    if (this.innerError) {
      throw this.innerError;
    }
  }
}
