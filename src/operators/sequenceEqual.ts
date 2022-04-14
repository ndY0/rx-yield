import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const sequenceEqual: <T>(compareTo: Observable<T>, comparator: (a: T, b: T) => boolean) => OperatorFunction<T, boolean> =
  <T>(compareTo: Observable<T>, comparator: (a: T, b: T) => boolean) =>
  (input: Observable<T>) => {
    return new Observable<boolean>(async function* (
      throwError: (error: any) => void
    ) {
      let innerRunner: AsyncGenerator<Awaited<T>, void, unknown>;
      let outterRunner: AsyncGenerator<Awaited<T>, void, unknown>;
      let promiseOutter: Promise<any> | undefined = undefined;
      let promiseInner: Promise<any> | undefined = undefined;
      let runningInner = true;
      let runningOutter = true;
      let innerValue: T | undefined = undefined;
      let outterValue: T | undefined = undefined;
      const runInner = () => {
        promiseInner = innerRunner
          .next()
          .then((res) => {
            if (res.done) {
              runningOutter = false;
              runningInner = false;
            }
            if (res.value !== undefined) {
              innerValue = res.value;
            }
          })
          .catch((e) => {
            runningInner = false;
            runningOutter = false;
            throwError(e);
          });
      };
      const forkInner = () => {
        innerRunner = input.subscribe();
        runInner();
      };
      const runOutter = () => {
        promiseOutter = outterRunner.next()
          .then((res) => {
            if(res.done) {
              runningOutter = false;
              runningInner = false;
            }
            if (res.value !== undefined) {
              outterValue = res.value
            }
          })
          .catch((e) => {
            runningInner = false;
            runningOutter = false;
            throwError(e);
          });
      };
      const forOutter = () => {
        outterRunner = compareTo.subscribe();
        runOutter();
      };
      forkInner();
      forOutter();
      while (runningInner || runningOutter) {
        await Promise.allSettled([promiseInner, promiseOutter]);
        if (innerValue !== undefined && outterValue !== undefined) {
          yield comparator(innerValue, outterValue);
          innerValue = undefined;
          outterValue = undefined;
          runInner();
          runOutter();
        }
      }
    });
  };

export { sequenceEqual };
