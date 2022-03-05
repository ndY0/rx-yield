import { FifoBuffer } from "../buffers/fifo.buffer";
import { Buffer } from "../buffers/buffer";
import { IBuffer } from "../interfaces/buffer.interface";
import { Observer } from "../observer";
import { OperatorFunction } from "../types";
import { pipeFromArray } from "../utils";

export class Observable<T> implements AsyncGenerator<T, void, T> {
  public readonly observer: AsyncGenerator<T, void, T>;
  private readonly buffer: IBuffer;
  constructor(
    factory: (observer: AsyncGenerator<T, void, T>) => void,
    bufferSize?: number
    // buffer?: { new (...args: any[]): Buffer & IBuffer<T> }
  ) {
    this.observer = (async function* () {
      let data: T | undefined = undefined;
      while (true) {
        const next: T = yield data as T;

        if (next) data = next;
      }
    })();
    factory(this.observer);
    this.observer.next();
    this.buffer = new FifoBuffer(bufferSize ? bufferSize : 1_000);

    // const observer = new Observer<
    //   T,
    //   { new (...args: any[]): Buffer & IBuffer<T> }
    // >(bufferSize, buffer);
    // this.observer = observer;
    // oberverCallback(observer);
  }
  next(...args: [] | [T]): Promise<IteratorResult<void, T>> {}
  return(value: void | PromiseLike<void>): Promise<IteratorResult<T, void>> {
    throw new Error("Method not implemented.");
  }
  throw(e: any): Promise<IteratorResult<T, void>> {
    throw new Error("Method not implemented.");
  }
  [Symbol.asyncIterator](): AsyncGenerator<T, void, unknown> {
    throw new Error("Method not implemented.");
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
    return pipeFromArray(operators)(this);
  }
  async *flow(): AsyncGenerator<T, void, unknown> {
    for await (const elem of this.observer) {
      yield elem;
    }
  }
}

const obs = new Observable<{}>(
  async function* (obs) {
    obs.next({});
    obs.complete();
  },
  1000,
  FifoBuffer
);
obs.pipe((input: Observable<{}>) => {
  return input;
});
