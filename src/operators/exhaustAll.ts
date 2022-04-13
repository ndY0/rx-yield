import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const exhaustAll: <T>() => OperatorFunction<Observable<T>, T> =
  <T>() =>
  (input: Observable<Observable<T>>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      let innerRunning = false;
      let outterRunning = true;
      let innerRunner: AsyncGenerator<Awaited<T>, void, unknown> | undefined =
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
      const forkInner = async (outterValue: Observable<T>) => {
        innerRunning = true;
        innerRunner = outterValue.subscribe();
      };
      const runOutter = (
        runner: AsyncGenerator<Awaited<Observable<T>>, void, unknown>
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
                forkInner(res.value);
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

export { exhaustAll };
