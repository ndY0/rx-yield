import { Observable } from "../observable";
import { OperatorFunction } from "../types";

function withLatestFrom<T, A>(
  input1: Observable<A>
): OperatorFunction<T, [T, A]>;
function withLatestFrom<T, A, B>(
  input1: Observable<A>,
  input2: Observable<B>
): OperatorFunction<T, [T, A, B]>;
function withLatestFrom<T, A, B, C>(
  input1: Observable<A>,
  input2: Observable<B>,
  input3: Observable<C>
): OperatorFunction<T, [T, A, B, C]>;
function withLatestFrom<T, A, B, C, D>(
  input1: Observable<A>,
  input2: Observable<B>,
  input3: Observable<C>,
  input4: Observable<D>
): OperatorFunction<T, [T, A, B, C, D]>;
function withLatestFrom<T, A, B, C, D, E>(
  input1: Observable<A>,
  input2: Observable<B>,
  input3: Observable<C>,
  input4: Observable<D>,
  input5: Observable<E>
): OperatorFunction<T, [T, A, B, C, D, E]>;
function withLatestFrom<T, A, B, C, D, E, F>(
  input1: Observable<A>,
  input2: Observable<B>,
  input3: Observable<C>,
  input4: Observable<D>,
  input5: Observable<E>,
  input6: Observable<F>,
): OperatorFunction<T, [T, A, B, C, D, E, F]>;
function withLatestFrom<T, A, B, C, D, E, F, G>(
  input1: Observable<A>,
  input2: Observable<B>,
  input3: Observable<C>,
  input4: Observable<D>,
  input5: Observable<E>,
  input6: Observable<F>,
  input7: Observable<G>,
): OperatorFunction<T, [T, A, B, C, D, E, F, G]>;
function withLatestFrom<T, A, B, C, D, E, F, G, H>(
  input1: Observable<A>,
  input2: Observable<B>,
  input3: Observable<C>,
  input4: Observable<D>,
  input5: Observable<E>,
  input6: Observable<F>,
  input7: Observable<G>,
  input8: Observable<H>,
): OperatorFunction<T, [T, A, B, C, D, E, F, G, H]>;
function withLatestFrom<T, A, B, C, D, E, F, G, H, I>(
  input1: Observable<A>,
  input2: Observable<B>,
  input3: Observable<C>,
  input4: Observable<D>,
  input5: Observable<E>,
  input6: Observable<F>,
  input7: Observable<G>,
  input8: Observable<H>,
  input9: Observable<I>,
): OperatorFunction<T, [T, A, B, C, D, E, F, G, H, I]>;
function withLatestFrom<T, A, B, C, D, E, F, G, H, I, J>(
  input1: Observable<A>,
  input2: Observable<B>,
  input3: Observable<C>,
  input4: Observable<D>,
  input5: Observable<E>,
  input6: Observable<F>,
  input7: Observable<G>,
  input8: Observable<H>,
  input9: Observable<I>,
  input10: Observable<J>,
): OperatorFunction<T, [T, A, B, C, D, E, F, G, H, I, J]>;

function withLatestFrom<T>(...inputs: Observable<any>[]) {
  return (input: Observable<T>) => {
    return new Observable<any[]>(async function* (
      throwError: (error: any) => void
    ) {
      const runners: Map<
        number,
        AsyncGenerator<Awaited<any>, void, unknown>
      > = new Map(
        [input, ...inputs].map((obs, index) => [index, obs.subscribe()])
      );
      const isRunning: Map<number, boolean> = new Map(
        Array.from({ length: inputs.length + 1 }).map((_, index) => [
          index,
          true,
        ])
      );
      const promises: Map<number, Promise<any> | undefined> = new Map(
        Array.from({ length: inputs.length + 1 }).map((_, index) => [
          index,
          undefined,
        ])
      );
      const values: Map<number, any | undefined> = new Map(
        Array.from({ length: inputs.length + 1 }).map((_, index) => [
          index,
          undefined,
        ])
      );
      const run = (index: number) => {
        const runner = runners.get(index);
        if (runner) {
          promises.set(
            index,
            runner
              .next()
              .then((res) => {
                if (res.done) {
                  isRunning.set(index, false);
                  promises.set(index, undefined);
                }
                if (res.value !== undefined) {
                  values.set(index, res.value);
                }
                if (isRunning.get(index)) {
                  run(index);
                }
              })
              .catch((e) => {
                Array.from(isRunning.keys()).forEach((key) => {
                  isRunning.set(key, false);
                });
                throwError(e);
              })
          );
        }
      };
      Array.from(runners.keys()).forEach((key) => {
        run(key);
      });
      while (isRunning.get(0)) {
        await promises.get(0);
        if (
          Array.from(values.values()).reduce(
            (acc, curr) => acc && curr !== undefined,
            true
          )
        ) {
          yield Array.from(values.values());
        }
        if (!isRunning.get(0)) {
          Array.from(isRunning.keys()).forEach((key) => {
            isRunning.set(key, false);
          });
        }
      }
    });
  };
}
export { withLatestFrom };
