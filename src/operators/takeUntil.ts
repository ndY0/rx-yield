import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const takeUntil: <T>(
  notifier: Observable<any>
) => OperatorFunction<T, T | void> =
  <T>(notifier: Observable<any>) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (throwError: (error: any) => void) {
      const buildPromise = (runner: AsyncGenerator<any, void, unknown>) => runner.next();
      let isRunningOutter = true;
      const outterRunner = input.subscribe();
      const innerRunner = notifier.subscribe();
      let outterValue: T | undefined = undefined;
      let innerValue: any | undefined = undefined;
      let outterPromise = buildPromise(outterRunner).then((res) => {
        if(res.done) {
          isRunningOutter = false;
        }
        if(res.value !== undefined) {
          if(innerValue === undefined) {
            outterValue = res.value
          } else {
            isRunningOutter = false;
          }
        }
        return res;
      }).catch((err) => throwError(err));
      let innerPromise: Promise<any> | undefined = buildPromise(innerRunner).then((res) => {
        if(res.value !== undefined) {
          innerValue = res.value
          isRunningOutter = false;
        }
        return res;
      }).catch(() => {});
      while (isRunningOutter) {
        if(outterValue !== undefined && innerValue === undefined) {
          yield outterValue;
          outterValue = undefined;
          outterPromise = buildPromise(outterRunner).then((res) => {
            if(res.done) {
              isRunningOutter = false;
            }
            if(res.value !== undefined) {
              if(innerValue === undefined) {
                outterValue = res.value
              } else {
                isRunningOutter = false;
              }
            }
            return res;
          }).catch((err) => throwError(err));
        }
        await outterPromise
      }
    });
  };

export { takeUntil };
