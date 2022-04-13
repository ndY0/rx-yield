import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const mergeScan: <T, R>(
  accumulator: (acc: R, curr: T) => Observable<R>,
  seed: R
) => OperatorFunction<T, R> =
  <T, R>(accumulator: (acc: R, curr: T) => Observable<R>, seed: R) =>
  (input: Observable<T>) => {
    return new Observable<R>(async function* (
      throwError: (error: any) => void
    ) {
      let count = 0;
      let accumulated: R = seed;
      const innerRunning: Map<number, boolean> = new Map();
      let outterRunning = true;
      const innerRunner: Map<
        number,
        AsyncGenerator<Awaited<R>, void, unknown>
      > = new Map();
      const innerPromise: Map<number, Promise<any> | undefined> = new Map();
      let outterPromise: Promise<any> | undefined = undefined;
      const innerValue: Map<number, R | undefined> = new Map();
      const runInner = (
        runner: AsyncGenerator<Awaited<R>, void, unknown>,
        index: number
      ) => {
        innerPromise.set(
          index,
          runner
            .next()
            .then((res) => {
              if (res.done) {
                innerRunning.delete(index);
                innerPromise.delete(index);
                innerRunner.delete(index);
              }
              if (res.value !== undefined) {
                innerValue.set(index, res.value);
              }
            })
            .catch((e) => {
              Array.from(innerRunning.keys()).forEach((index) =>
                innerRunning.set(index, false)
              );
              outterRunning = false;
              throwError(e);
            })
        );
      };
      const forkInner = async (outterValue: T, index: number) => {
        innerRunning.set(index, true);
        innerRunner.set(index, accumulator(accumulated, outterValue).subscribe());
        innerPromise.set(index, undefined);
        innerValue.set(index, undefined);
      };
      const runOutter = (runner: AsyncGenerator<Awaited<T>, void, unknown>) => {
        outterPromise = runner
          .next()
          .then((res) => {
            if (res.done) {
              outterRunning = false;
              outterPromise = undefined;
            }
            if (res.value !== undefined) {
              count += 1;
              forkInner(res.value, count);
              runOutter(runner);
            }
          })
          .catch((e) => {
            Array.from(innerRunning.keys()).forEach((index) =>
              innerRunning.set(index, false)
            );
            outterRunning = false;
            throwError(e);
          });
      };
      const forkOutter = () => {
        const outterRunner = input.subscribe();
        runOutter(outterRunner);
      };
      forkOutter();
      while (
        Array.from(innerRunning.values()).reduce(
          (acc, curr) => acc || curr,
          false
        ) ||
        outterRunning
      ) {
        await Promise.any(
          [
            outterPromise,
            ...Array.from(innerPromise.values()).filter(
              (promise) => promise !== undefined
            ),
          ].filter((promise) => promise !== undefined)
        );
        for (const [index, elem] of Array.from(innerValue.entries())) {
          if (elem !== undefined) {;
            accumulated = elem
            yield elem;
            if (innerRunning.get(index) === undefined) {
              innerValue.delete(index);
            } else {
              innerValue.set(index, undefined);
            }
            if (
              innerRunner.get(index) !== undefined &&
              innerRunning.get(index)
            ) {
              runInner(innerRunner.get(index) as any, index);
            }
          } else {
            if (
              innerRunner.get(index) !== undefined &&
              innerRunning.get(index)
            ) {
              runInner(innerRunner.get(index) as any, index);
            }
          }
        }
      }
    });
  };

export { mergeScan };
