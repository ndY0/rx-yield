import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const sample: <T>(notifier: Observable<any>) => OperatorFunction<T, T> =
  <T>(notifier: Observable<any>) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      let sample: T | undefined = undefined;
      let promise: Promise<any> | undefined = undefined;
      let runningInner = true;
      let runningSampler = true;
      const runInner = (runner: AsyncGenerator<Awaited<T>, void, unknown>) => {
        runner
          .next()
          .then((res) => {
            if (res.done) {
              runningInner = false;
            }
            if (res.value !== undefined && runningSampler) {
              sample = res.value;
              runInner(runner);
            }
          })
          .catch((e) => {
            runningInner = false;
            runningSampler = false;
            throwError(e);
          });
      };
      const forkInner = () => {
        runInner(input.subscribe());
      };
      const runOutter = (runner: AsyncGenerator<any, void, unknown>) => {
        promise = runner.next()
          .then((res) => {
            if(res.done) {
              runningInner = false;
              runningSampler = false;
            }
            if (runningInner && res.value !== undefined) {
              runOutter(runner);
            }
            if(!runningInner) {
              runningSampler = false;
            }
          })
          .catch((e) => {
            runningInner = false;
            runningSampler = false;
            throwError(e);
          });
      };
      const forOutter = () => {
        runOutter(notifier.subscribe());
      };
      forkInner();
      forOutter();
      while (runningInner || runningSampler) {
        await promise;
        if (sample !== undefined) {
          yield sample;
          sample = undefined;
        }
      }
    });
  };

export { sample };
