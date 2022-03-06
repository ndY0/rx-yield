import { EventEmitter } from "events";
import { promisify } from "util";
import { FifoBuffer } from "../buffers/fifo.buffer";

import { OperatorFunction } from "../types";
import { pipeFromArray } from "../utils";

export class Observable<T> {
  private readonly observer = new EventEmitter();
  private readonly buffer = new FifoBuffer<T>(1000);
  private readonly factory: AsyncGenerator<T, void, void>;
  constructor(factory: () => AsyncGenerator<T, void, void>) {
    this.factory = factory();
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
    let runningRead = true;
    let runningWrite = true;
    const runner = async () => {
      while (runningWrite) {
        const data = await this.factory.next();
        if (data.done) {
          runningWrite = false;
        } else {
          const permitted = this.buffer.write(data.value);
          this.observer.emit("drain");
          if (!permitted) {
            await promisify(this.observer.once.bind(this.observer))("resume");
            this.buffer.write(data.value);
          }
        }
      }
    };
    runner();
    while (runningRead) {
      const data = this.buffer.read();
      this.observer.emit("resume");
      if (data) {
        yield data;
      } else {
        if (runningWrite) {
          await promisify(this.observer.once.bind(this.observer))("drain");
          yield this.buffer.read();
        } else {
          runningRead = false;
        }
      }
    }
  }
}

// const obs = new Observable(async function* () {
//   for (let index = 0; index < 100; index++) {
//     await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
//     yield index;
//     yield "ok";
//   }
// });
// obs.pipe((input: Observable<{}>) => {
//   return input;
// });
