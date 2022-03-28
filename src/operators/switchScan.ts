import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const switchScan: <T, R>(accumulator: (acc: R, curr: T) => Observable<R>, seed: R) => OperatorFunction<T, R> =
  <T, R>(accumulator: (acc: R, curr: T) => Observable<R>, seed: R) =>
  (input: Observable<T>) => {
    const buildPromise = <U>(
      runner: AsyncGenerator<Awaited<U> | undefined, void, unknown>
    ) =>
        runner.next()
        
    return new Observable<R>(async function* (throwError: (error: any) => void) {
      let accumulated: R | undefined = undefined
      let isRunningOutter = true;
      let isRunningInner = false;
      let outterValue: T | undefined = undefined;
      let innerValue: R | undefined = undefined;
      const outterRunner = input.subscribe();
      let innerRunner:
        | AsyncGenerator<Awaited<R> | undefined, void, unknown>
        | undefined = undefined;
      let outterPromise: Promise<any> | undefined = buildPromise(
        outterRunner
      ).then((res) => {
        if (res.done) {
          isRunningOutter = false;
        }
        if (res.value !== undefined) {
          outterValue = res.value;
        }
        return res.value
      }).catch((e) => {
        isRunningOutter = false;
        throwError(e)
      });
      let innerPromise: Promise<any> | undefined = undefined;
      while (isRunningOutter || isRunningInner) {
        if (outterValue !== undefined) {
          innerRunner = accumulator(accumulated !== undefined ? accumulated :  seed, outterValue).subscribe();
          isRunningInner = true
          outterValue = undefined;
          innerPromise = undefined;
          outterPromise = buildPromise(outterRunner).then((res) => {
            if (res.done) {
              isRunningOutter = false;
              outterPromise = undefined;
            }
            if (res.value !== undefined) {
              outterValue = res.value;
            }
            return res.value
          }).catch((e) => {
            isRunningOutter = false;
            throwError(e)
          });
        }
        if (innerRunner && innerValue === undefined) {
          isRunningInner = true
          innerPromise = buildPromise(innerRunner).then((res) => {
            if (res.done) {
              isRunningInner = false;
              innerPromise = undefined;
              innerRunner = undefined;
            }
            if (res.value !== undefined) {
              innerValue = res.value;
              accumulated = innerValue;
              innerPromise = undefined;
            }
            return res.value
          }).catch((e) => {
            isRunningInner = false;
            throwError(e)
          });
        }
        if (innerValue !== undefined) {
          yield innerValue;
          innerValue = undefined;
        }
        if(outterPromise !== undefined && innerPromise !== undefined) {
          await Promise.any([innerPromise, outterPromise])
        }
        if(isRunningInner && innerPromise === undefined && outterPromise !== undefined) {
          continue;
        }
        if(! isRunningInner && outterPromise !== undefined) {
          await outterPromise
        }
      }
    });
  };
  
export { switchScan };
