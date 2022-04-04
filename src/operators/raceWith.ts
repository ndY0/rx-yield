import { Observable } from "../observable";
import { OperatorFunction } from "../types";

function raceWith<T, A>(source1: Observable<A>): OperatorFunction<T, T | A>;
function raceWith<T, A, B>(
  source1: Observable<A>,
  source2: Observable<B>
): OperatorFunction<T, T | A | B>;
function raceWith<T, A, B, C>(
  source1: Observable<A>,
  source2: Observable<B>,
  source3: Observable<C>
): OperatorFunction<T, T | A | B | C>;
function raceWith<T, A, B, C, D>(
  source1: Observable<A>,
  source2: Observable<B>,
  source3: Observable<C>,
  source4: Observable<D>
): OperatorFunction<T, T | A | B | C | D>;
function raceWith<T, A, B, C, D, E>(
  source1: Observable<A>,
  source2: Observable<B>,
  source3: Observable<C>,
  source4: Observable<D>,
  source5: Observable<E>
): OperatorFunction<T, T | A | B | C | D | E>;
function raceWith<T, A, B, C, D, E, F>(
  source1: Observable<A>,
  source2: Observable<B>,
  source3: Observable<C>,
  source4: Observable<D>,
  source5: Observable<E>,
  source6: Observable<F>
): OperatorFunction<T, T | A | B | C | D | E | F>;
function raceWith<T, A, B, C, D, E, F, G>(
  source1: Observable<A>,
  source2: Observable<B>,
  source3: Observable<C>,
  source4: Observable<D>,
  source5: Observable<E>,
  source6: Observable<F>,
  source7: Observable<G>
): OperatorFunction<T, T | A | B | C | D | E | F | G>;
function raceWith<T, A, B, C, D, E, F, G, H>(
  source1: Observable<A>,
  source2: Observable<B>,
  source3: Observable<C>,
  source4: Observable<D>,
  source5: Observable<E>,
  source6: Observable<F>,
  source7: Observable<G>,
  source8: Observable<H>
): OperatorFunction<T, T | A | B | C | D | E | F | G | H>;
function raceWith<T, A, B, C, D, E, F, G, H, I>(
  source1: Observable<A>,
  source2: Observable<B>,
  source3: Observable<C>,
  source4: Observable<D>,
  source5: Observable<E>,
  source6: Observable<F>,
  source7: Observable<G>,
  source8: Observable<H>,
  source9: Observable<I>
): OperatorFunction<T, T | A | B | C | D | E | F | G | H | I>;
function raceWith<T, A, B, C, D, E, F, G, H, I, J>(
  source1: Observable<A>,
  source2: Observable<A>,
  source3: Observable<B>,
  source4: Observable<A>,
  source5: Observable<B>,
  source6: Observable<A>,
  source7: Observable<B>,
  source8: Observable<A>,
  source9: Observable<B>,
  source10: Observable<A>
): OperatorFunction<T, T | A | B | C | D | E | F | G | H | I | J>;

function raceWith<T>(...sources: Observable<any>[]): OperatorFunction<T, any> {
  return (input: Observable<T>) => {
    return new Observable<any>(async function* (
      throwError: (error: any) => void
    ) {
      let runnerIndex: number | undefined = undefined;
      const initialResults: Map<number, any> = new Map();
      const initialPromises: Promise<any>[] = [];
      const runners = new Map(
        [input, ...sources].map((obs: Observable<any>, index: number) => [
          index,
          obs.subscribe(),
        ])
      );
      Array.from(runners.entries()).forEach(([index, runner]) => {
        initialPromises.push(
          runner
            .next()
            .then((elem) => {
              if (elem.value !== undefined) {
                initialResults.set(index, elem.value);
                if (runnerIndex === undefined) {
                  runnerIndex = index;
                }
              }
              return elem;
            })
            .catch((e) => {
              if (runnerIndex === undefined) {
                throwError(e);
              }
            })
        );
      });
      await Promise.any(initialPromises);
      if (runnerIndex !== undefined) {
        yield initialResults.get(runnerIndex);
        try {
          for await (const elem of runners.get(runnerIndex) as AsyncGenerator<
            any,
            void,
            unknown
          >) {
            yield elem;
          }
        } catch (e) {
          throwError(e);
        }
      }
    });
  };
}

export { raceWith };
