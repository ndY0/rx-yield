import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const switchAll: <T>() => OperatorFunction<Observable<T>, T> =
  <T>() =>
  (input: Observable<Observable<T>>) => {
    const buildPromise = <U>(
      runner: AsyncGenerator<Awaited<U> | undefined, void, unknown>
    ) => runner.next();
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      let isRunningOutter = true;
      let isRunningInner = false;
      let outterValue: Observable<T> | undefined = undefined;
      let innerValue: T | undefined = undefined;
      const outterRunner = input.subscribe();
      let innerRunner:
        | AsyncGenerator<Awaited<T> | undefined, void, unknown>
        | undefined = undefined;
      let outterPromise: Promise<any> | undefined = buildPromise(outterRunner)
        .then((res) => {
          if (res.done) {
            isRunningOutter = false;
          }
          if (res.value) {
            outterValue = res.value;
          }
          return res.value;
        })
        .catch((e) => {
          isRunningOutter = false;
          throwError(e);
        });
      let innerPromise: Promise<any> | undefined = undefined;
      while (isRunningOutter || isRunningInner) {
        if (outterValue) {
          innerRunner = (outterValue as Observable<T>).subscribe();
          outterValue = undefined;
          innerPromise = undefined;
          outterPromise = buildPromise(outterRunner)
            .then((res) => {
              if (res.done) {
                isRunningOutter = false;
                outterPromise = undefined;
              }
              if (res.value) {
                outterValue = res.value;
              }
              return res.value;
            })
            .catch((e) => {
              isRunningOutter = false;
              throwError(e);
            });
        }
        if (innerRunner && innerValue === undefined) {
          isRunningInner = true;
          innerPromise = buildPromise(innerRunner)
            .then((res) => {
              if (res.done) {
                isRunningInner = false;
                innerPromise = undefined;
                innerRunner = undefined;
              }
              if (res.value !== undefined) {
                innerValue = res.value;
                innerPromise = undefined;
              }
              return res.value;
            })
            .catch((e) => {
              isRunningInner = false;
              throwError(e);
            });
        }
        if (innerValue !== undefined) {
          yield innerValue;
          innerValue = undefined;
        }
        if (outterPromise !== undefined && innerPromise !== undefined) {
          await Promise.any([innerPromise, outterPromise]);
        }
        if (
          isRunningInner &&
          innerPromise === undefined &&
          outterPromise !== undefined
        ) {
          continue;
        }
        if (!isRunningInner && outterPromise !== undefined) {
          await outterPromise;
        }
      }
    });
  };

export { switchAll };
