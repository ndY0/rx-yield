import { Observable } from "../observable";
import { OperatorFunction } from "../types";
import {inspect} from "util"

function combineLatestAll<T>(): OperatorFunction<Observable<T>, T[]>;

function combineLatestAll<T, R>(
  project: (...elems: T[]) => R
): OperatorFunction<Observable<T>, R>;

function combineLatestAll<T>(
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
      const promises = new Map<
      number,
      Promise<void | IteratorYieldResult<Awaited<T>> | IteratorReturnResult<any>> | undefined
    >()
      const results = new Map<number, T>();
      const innerProject = project ? project : (...elems: T[]) => elems;
      let index = 0;
      let running = true;
      const buildPromise = (
        runner: AsyncGenerator<Awaited<T>, void, unknown>,
        index: number
      ) => {
        const promise = promises.set(index, runner
          .next()
          .then((elem: IteratorResult<Awaited<T>>) => {
            if (elem.done) {
              runners.set(index, undefined);
              promises.set(index, undefined)
            }
            if (elem.value !== undefined) {
              results.set(index, elem.value);
              buildPromise(runner, index)
            }
            return elem
          })
          .catch((e) => {
            console.log(e)
            throwError(e);
            running = false;
          }));
      };
      try {
        for await (const innerSource of input.subscribe()) {
          sources.set(index, innerSource);
          runners.set(index, innerSource.subscribe());
          index += 1;
        }
      } catch (e) {
        throwError(e);
        running = false;
      }
      Array.from(runners.entries())
          .filter(([_, runner]) => runner !== undefined)
          .forEach(([index, runner]) => buildPromise(runner as any, index))
      await Promise.any(
        Array.from(promises.values()).filter((promise) => promise !== undefined)
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
          await Promise.any(
          Array.from(promises.values()).filter((promise) => promise !== undefined)
        )
      }
    });
  };
}

export { combineLatestAll };
