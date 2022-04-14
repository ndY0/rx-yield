import { from } from "../creators/from";
import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const switchMapTo: <T>(
  innerObservable: Observable<T>
) => OperatorFunction<any, T> =
  <T>(innerObservable: Observable<T>) =>
  (input: Observable<any>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      let innerRunning = true;
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
              innerValue = undefined;
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
      const forkInner = async () => {
        innerRunning = true;
        innerRunner = from(innerObservable).subscribe();
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
              forkInner();
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

export { switchMapTo };
