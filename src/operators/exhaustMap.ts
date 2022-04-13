import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const exhaustMap: <T, R>(project: (value: T) => Observable<R>) => OperatorFunction<T, R> =
  <T, R>(project: (value: T) => Observable<R>) =>
  (input: Observable<T>) => {
    return new Observable<R>(async function* (
      throwError: (error: any) => void
    ) {
      let innerRunning = false;
      let outterRunning = true;
      let innerRunner: AsyncGenerator<Awaited<R>, void, unknown> | undefined =
        undefined;
      let innerPromise: Promise<any> | undefined = undefined;
      let outterPromise: Promise<any> | undefined = undefined;
      let innerValue: T | undefined = undefined;
      const runInner = (runner: AsyncGenerator<Awaited<T>, void, unknown>) => {
        innerPromise = runner
          .next()
          .then((res) => {
            if (res.done) {
              innerRunning = false;
              innerRunner = undefined;
              innerPromise = undefined;
            }
            if (res.value !== undefined) {
              innerValue = res.value;
            }
          })
          .catch((e) => {
            innerRunning = false;
            outterRunning = false;
            throwError(e);
          });
      };
      const forkInner = async (outterValue: Observable<R>) => {
        innerRunning = true;
        innerRunner = outterValue.subscribe();
      };
      const runOutter = (
        runner: AsyncGenerator<Awaited<T>, void, unknown>
      ) => {
        outterPromise = runner
          .next()
          .then((res) => {
            if (res.done) {
              outterRunning = false;
              outterPromise = undefined;
            }
            if (res.value !== undefined) {
              if (!innerRunning) {
                forkInner(project(res.value));
              }
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
        if (innerValue !== undefined) {
          yield innerValue;
          innerValue = undefined;
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

export { exhaustMap };
