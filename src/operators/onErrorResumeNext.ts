import { Observable } from "../observable";
import { OperatorFunction } from "../types";

function onErrorResumeNext<T, A>(
  source1: Observable<A>
): OperatorFunction<T, T | A>;
function onErrorResumeNext<T, A, B>(
  source1: Observable<A>,
  source2: Observable<B>
): OperatorFunction<T, T | A | B>;
function onErrorResumeNext<T, A, B, C>(
  source1: Observable<A>,
  source2: Observable<B>,
  source3: Observable<C>
): OperatorFunction<T, T | A | B | C>;
function onErrorResumeNext<T, A, B, C, D>(
  source1: Observable<A>,
  source2: Observable<B>,
  source3: Observable<C>,
  source4: Observable<D>
): OperatorFunction<T, T | A | B | C | D>;
function onErrorResumeNext<T, A, B, C, D, E>(
  source1: Observable<A>,
  source2: Observable<B>,
  source3: Observable<C>,
  source4: Observable<D>,
  source5: Observable<E>
): OperatorFunction<T, T | A | B | C | D | E>;
function onErrorResumeNext<T, A, B, C, D, E, F>(
  source1: Observable<A>,
  source2: Observable<B>,
  source3: Observable<C>,
  source4: Observable<D>,
  source5: Observable<E>,
  source6: Observable<F>
): OperatorFunction<T, T | A | B | C | D | E | F>;
function onErrorResumeNext<T, A, B, C, D, E, F, G>(
  source1: Observable<A>,
  source2: Observable<B>,
  source3: Observable<C>,
  source4: Observable<D>,
  source5: Observable<E>,
  source6: Observable<F>,
  source7: Observable<G>
): OperatorFunction<T, T | A | B | C | D | E | F | G>;
function onErrorResumeNext<T, A, B, C, D, E, F, G, H>(
  source1: Observable<A>,
  source2: Observable<B>,
  source3: Observable<C>,
  source4: Observable<D>,
  source5: Observable<E>,
  source6: Observable<F>,
  source7: Observable<G>,
  source8: Observable<H>
): OperatorFunction<T, T | A | B | C | D | E | F | G | H>;
function onErrorResumeNext<T, A, B, C, D, E, F, G, H, I>(
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
function onErrorResumeNext<T, A, B, C, D, E, F, G, H, I, J>(
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

function onErrorResumeNext<T>(
  ...sources: Observable<any>[]
): OperatorFunction<T, any> {
  return (input: Observable<T>) => {
    return new Observable<any>(async function* () {
      let runnerIndex = 0;
      const runners = new Map(
        [input, ...sources].map((obs: Observable<any>, index: number) => [
          index,
          obs.subscribe(),
        ])
      );
      while (true) {
        if (runners.get(runnerIndex) === undefined) {
          break;
        }
        try {
          for await (const elem of runners.get(runnerIndex) as AsyncGenerator<
            any,
            void,
            unknown
          >) {
            if (elem !== undefined) {
              yield elem;
            } else {
              break;
            }
          }
          runnerIndex += 1;
        } catch (e) {
          runnerIndex += 1;
        }
      }
    });
  };
}

export { onErrorResumeNext };
