import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const switchAll: <T>() => OperatorFunction<Observable<T>, T> =
  <T>() =>
  (input: Observable<Observable<T>>) => {
    const buildPromise = <U>(
      runner: AsyncGenerator<Awaited<U> | undefined, void, unknown>
    ) =>
        runner.next()
    return new Observable<T>(async function* () {
      let error: any | undefined = undefined;
      let isRunningOutter = true;
      let isRunningInner = true;
      let outterValue: Observable<T> | undefined = undefined;
      let innerValue: T | undefined = undefined;
      const outterRunner = input.subscribe();
      let innerRunner:
        | AsyncGenerator<Awaited<T> | undefined, void, unknown>
        | undefined = undefined;
      let outterPromise: Promise<any> | undefined = buildPromise(
        outterRunner
      ).then((res) => {
        if (res.done) {
          isRunningOutter = false;
        }
        if (res.value) {
          outterValue = res.value;
        }
        return res.value
      });
      let innerPromise: Promise<any> | undefined = undefined;
      while (isRunningOutter || isRunningInner) {
        if(error) {
          throw error;
        }
        if (outterValue) {
          innerRunner = (outterValue as Observable<T>).subscribe();
          isRunningInner = true
          outterValue = undefined;
          innerPromise = undefined;
          outterPromise = buildPromise(outterRunner).then((res) => {
            if (res.done) {
              isRunningOutter = false;
              outterPromise = undefined;
            }
            if (res.value) {
              outterValue = res.value;
            }
            return res.value
          }).catch((e) => error = e);
        }
        if (innerRunner && !innerPromise) {
          innerPromise = buildPromise(innerRunner).then((res) => {
            if (res.done) {
              isRunningInner = false;
              innerPromise = undefined;
              innerRunner = undefined;
            }
            if (res.value !== undefined) {
              innerValue = res.value;
              innerPromise = undefined;
            }
            return res.value
          }).catch((e) => error = e);
        }
        if (innerValue !== undefined) {
          yield innerValue;
          innerValue = undefined;
        }
        await Promise.any([innerPromise, outterPromise].filter((promise) => promise !== undefined));
      }
    });
  };
  
export { switchAll };
