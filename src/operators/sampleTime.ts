import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const sampleTime: <T>(period: number) => OperatorFunction<T, T> =
  <T>(period: number) =>
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
            if (res.value !== undefined) {
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
      const runOutter = () => {
        promise = new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, period);
        })
          .then(() => {
            if (runningInner) {
              runOutter();
            } else {
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
        runOutter();
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

export { sampleTime };
