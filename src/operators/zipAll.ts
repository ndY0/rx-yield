import { Observable } from "../observable";
import { OperatorFunction } from "../types";
import {inspect} from "util"

function zipAll<T>(): OperatorFunction<Observable<T>, T[]>;

function zipAll<T, R>(
  project: (...elems: T[]) => R
): OperatorFunction<Observable<T>, R>;

function zipAll<T>(
  project?: (...elems: T[]) => any
): OperatorFunction<Observable<T>, any> {
  return (input: Observable<Observable<T>>) => {
    return new Observable<any>(async function* (
      throwError: (error: any) => void
    ) {
      const sources = new Map<
        number,
        Observable<T>
      >();
      const runners = new Map<
        number,
        AsyncGenerator<Awaited<T>, void, unknown> | undefined
      >();
      const results = new Map<number, T>();
      const innerProject = project ? project : (...elems: T[]) => elems;
      let index = 0;
      let running = true;
      const buildPromise = (
        runner: AsyncGenerator<Awaited<T>, void, unknown>,
        index: number
      ) => {
        return runner
          .next()
          .then((elem: IteratorResult<Awaited<T>>) => {
            if (elem.done) {
              index -= 1;
              runners.set(index, undefined);
            }
            if (elem.value !== undefined) {
              results.set(index, elem.value);
            }
            return elem
          })
          .catch((e) => {
            throwError(e);
            running = false;
          });
      };
      try {
        for await (const innerSource of input.subscribe()) {
          sources.set(index, innerSource);
          runners.set(index, innerSource.subscribe());
          console.log(inspect(runners, true, null, true));
          // console.log(inspect(sources, true, null, true));
          index += 1;
        }
        console.log("allo ?")
      } catch (e) {
        console.log(e)
        throwError(e);
        running = false;
      }
      console.log("here ?")
      await Promise.allSettled(
        Array.from(runners.entries())
          .filter(([_, runner]) => runner !== undefined)
          .map(([index, runner]) => buildPromise(runner as any, index))
      );
      while (running) {
        yield innerProject(
          ...Array.from(results.values()).filter((value) => value !== undefined)
        );
        if (
          Array.from(runners.values()).reduce(
            (acc, curr) => acc && curr === undefined,
            true
          )
        ) {
          running = false;
          continue;
        }
        await Promise.allSettled(
          Array.from(runners.entries())
            .filter(([_, runner]) => runner !== undefined)
            .map(([index, runner]) => buildPromise(runner as any, index))
        );
      }
    });
  };
}

export { zipAll };
