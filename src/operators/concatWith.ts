import { Observable } from "../observable";
import { OperatorFunction } from "../types";

function concatWith<T, E>(source1: Observable<E>): OperatorFunction<T, T | E>;

function concatWith<T, E, F>(
  source1: Observable<E>,
  source2: Observable<F>
): OperatorFunction<T, T | E | F>;

function concatWith<T, E, F, G>(
  source1: Observable<E>,
  source2: Observable<F>,
  source3: Observable<G>
): OperatorFunction<T, T | E | F | G>;

function concatWith<T, E, F, G, H>(
  source1: Observable<E>,
  source2: Observable<F>,
  source3: Observable<G>,
  source4: Observable<H>
): OperatorFunction<T, T | E | F | G | H>;

function concatWith<T, E, F, G, H, I>(
  source1: Observable<E>,
  source2: Observable<F>,
  source3: Observable<G>,
  source4: Observable<H>,
  source5: Observable<I>
): OperatorFunction<T, T | E | F | G | H | I>;

function concatWith<T, E, F, G, H, I, J>(
  source1: Observable<E>,
  source2: Observable<F>,
  source3: Observable<G>,
  source4: Observable<H>,
  source5: Observable<I>,
  source6: Observable<J>
): OperatorFunction<T, T | E | F | G | H | I | J>;

function concatWith<T, E, F, G, H, I, J, K>(
  source1: Observable<E>,
  source2: Observable<F>,
  source3: Observable<G>,
  source4: Observable<H>,
  source5: Observable<I>,
  source6: Observable<J>,
  source7: Observable<K>
): OperatorFunction<T, T | E | F | G | H | I | J | K>;

function concatWith<T, E, F, G, H, I, J, K, L>(
  source1: Observable<E>,
  source2: Observable<F>,
  source3: Observable<G>,
  source4: Observable<H>,
  source5: Observable<I>,
  source6: Observable<J>,
  source7: Observable<K>,
  source8: Observable<L>
): OperatorFunction<T, T | E | F | G | H | I | J | K | L>;

function concatWith<T, E, F, G, H, I, J, K, L, M>(
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

function concatWith<T, E, F, G, H, I, J, K, L, M, N>(
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

function concatWith <
  T
>(...sources: Observable<any>[]): OperatorFunction<T, any> {
  return (input: Observable<T>) => {
    return new Observable<any>(async function* (
      throwError: (error: any) => void
    ) {
      const runners = new Map<
        number,
        AsyncGenerator<Awaited<T>, void, unknown>
      >();
      let index = 0;
      let running = true;
      [input, ...sources].forEach((source, index) => runners.set(index, source.subscribe()))
      try {
        for (const [_, runner] of runners) {
          for await (const elem of runner) {
            yield elem
          }
        }
      } catch (error) {
        throwError(error);
      }
    });
  };
};

export { concatWith };
