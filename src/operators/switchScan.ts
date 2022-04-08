import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const switchScan: <T, R>(
  accumulator: (acc: R, curr: T) => Observable<R>, seed: R
) => OperatorFunction<T, R> =
  <T, R>(accumulator: (acc: R, curr: T) => Observable<R>, seed: R) =>
  (input: Observable<T>) => {
    return new Observable<R>(async function* (
      throwError: (error: any) => void
    ) {
      let innerRunning = true;
      let outterRunning = true;
      let accumulated: R = seed;
      let innerRunner: AsyncGenerator<Awaited<R>, void, unknown> | undefined =
        undefined;
      let innerPromise: Promise<any> | undefined = undefined;
      let outterPromise: Promise<any> | undefined = undefined;
      let innerValue: R | undefined = undefined;
      const runInner = (runner: AsyncGenerator<Awaited<R>, void, unknown>) => {
        innerPromise = runner
          .next()
          .then((res) => {
            if (res.done) {
              innerRunning = false;
              innerValue = undefined;
              innerPromise = undefined;
            }
            if (res.value !== undefined) {
              accumulated = res.value; 
              innerValue = res.value;
            }
          })
          .catch((e) => {
            innerRunning = false;
            outterRunning = false;
            throwError(e);
          });
      };
      const forkInner = async (outterValue: T) => {
        innerRunning = true;
        innerRunner = accumulator(accumulated, outterValue).subscribe();
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
              innerValue = undefined;
              forkInner(res.value);
              runOutter(runner);
            }
          })
          .catch((e) => {
            innerRunning = false;
            outterRunning = false;
            throwError(e);
          });
      };
      const forkOutter = () => {
        const outterRunner = input.subscribe();
        runOutter(outterRunner);
      };
      forkOutter();
      while (innerRunning || outterRunning) {
        await Promise.any(
          [outterPromise, innerPromise].filter(
            (promise) => promise !== undefined
          )
        );
        if (innerValue) {
          yield innerValue;
          innerValue === undefined;
          if (innerRunner && innerRunning) {
            runInner(innerRunner);
          }
        } else {
          if (innerRunner && innerRunning) {
            runInner(innerRunner);
          }
        }
      }
    });
  };

export { switchScan };
