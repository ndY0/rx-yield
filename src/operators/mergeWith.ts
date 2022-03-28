import { Observable } from "../observable";
import { OperatorFunction } from "../types";

function mergeWith<T, E>(source1: Observable<E>): OperatorFunction<T, T | E>;

function mergeWith<T, E, F>(
  source1: Observable<E>,
  source2: Observable<F>
): OperatorFunction<T, T | E | F>;

function mergeWith<T, E, F, G>(
  source1: Observable<E>,
  source2: Observable<F>,
  source3: Observable<G>
): OperatorFunction<T, T | E | F | G>;

function mergeWith<T, E, F, G, H>(
  source1: Observable<E>,
  source2: Observable<F>,
  source3: Observable<G>,
  source4: Observable<H>
): OperatorFunction<T, T | E | F | G | H>;

function mergeWith<T, E, F, G, H, I>(
  source1: Observable<E>,
  source2: Observable<F>,
  source3: Observable<G>,
  source4: Observable<H>,
  source5: Observable<I>
): OperatorFunction<T, T | E | F | G | H | I>;

function mergeWith<T, E, F, G, H, I, J>(
  source1: Observable<E>,
  source2: Observable<F>,
  source3: Observable<G>,
  source4: Observable<H>,
  source5: Observable<I>,
  source6: Observable<J>
): OperatorFunction<T, T | E | F | G | H | I | J>;

function mergeWith<T, E, F, G, H, I, J, K>(
  source1: Observable<E>,
  source2: Observable<F>,
  source3: Observable<G>,
  source4: Observable<H>,
  source5: Observable<I>,
  source6: Observable<J>,
  source7: Observable<K>
): OperatorFunction<T, T | E | F | G | H | I | J | K>;

function mergeWith<T, E, F, G, H, I, J, K, L>(
  source1: Observable<E>,
  source2: Observable<F>,
  source3: Observable<G>,
  source4: Observable<H>,
  source5: Observable<I>,
  source6: Observable<J>,
  source7: Observable<K>,
  source8: Observable<L>
): OperatorFunction<T, T | E | F | G | H | I | J | K | L>;

function mergeWith<T, E, F, G, H, I, J, K, L, M>(
  source1: Observable<E>,
  source2: Observable<F>,
  source3: Observable<G>,
  source4: Observable<H>,
  source5: Observable<I>,
  source6: Observable<J>,
  source7: Observable<K>,
  source8: Observable<L>,
  source9: Observable<M>
): OperatorFunction<T, T | E | F | G | H | I | J | K | L | M>;

function mergeWith<T, E, F, G, H, I, J, K, L, M, N>(
  source1: Observable<E>,
  source2: Observable<F>,
  source3: Observable<G>,
  source4: Observable<H>,
  source5: Observable<I>,
  source6: Observable<J>,
  source7: Observable<K>,
  source8: Observable<L>,
  source9: Observable<M>,
  source10: Observable<N>
): OperatorFunction<T, T | E | F | G | H | I | J | K | L | M | N>;

function mergeWith<T>(...sources: Observable<any>[]): OperatorFunction<T, any> {
  return (input: Observable<T>) => {
    return new Observable<any>(async function* (throwError: (error: any) => void) {
      const innerCurrentValue: Map<number, any | undefined> = new Map<
        number,
        any | undefined
      >(
        Array.from({ length: sources.length + 1 }).map((_, index) => [
          index,
          undefined,
        ])
      );
      const isRunningInner = new Map<number, boolean>(
        Array.from({ length: sources.length + 1 }).map((_, index) => [index, true])
      );
      const buildPromise = (runner: AsyncGenerator<any, void, unknown>, index: number) => new Promise<any>((resolve) => 
        runner.next().then((res) => {
          if(!res.done) {
            innerCurrentValue.set(index, res);
          } else {
            isRunningInner.set(index, false);
          }

          resolve(res);

        }).catch((err) => throwError(err))
      )
      const innerRunner = new Map([input, ...sources].map((source: Observable<any>, index) =>
      [index, source.subscribe()]
      ));
      const innerPromise: Map<number, Promise<any>> = new Map<
        number,
        Promise<any>
      >(
        Array.from(innerRunner.values()).map((value, index) => [
          index,
          buildPromise(value, index),
        ])
      );
      while (
        Array.from(isRunningInner.values()).reduce(
          (acc, curr) => acc || curr,
          false
        )
      ) {
        for (const [index, value] of innerCurrentValue) {
          if (value) {
            yield value.value;
            innerCurrentValue.set(index, undefined);
            innerPromise.set(index, buildPromise(innerRunner.get(index) as AsyncGenerator<any, void, unknown>, index))
          }
        }
        await Promise.any(Array.from(innerPromise.values()));
      }
    });
  };
}

export { mergeWith };
