import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const exhaustMap: <T, E>(
  factory: (element: T) => Observable<E>
) => OperatorFunction<T, E> =
  <T, E>(factory: (element: T) => Observable<E>) =>
  (input: Observable<T>) => {
    return new Observable<E>(async function* (
      throwError: (error: any) => void
    ) {
      let isRunningOutter = true;
      let isRunningInner = true;
      let outterCurrentValue: T | undefined = undefined;
      let runningOutter:
        | Promise<IteratorResult<Awaited<T> | undefined, void>>
        | undefined = undefined;
      let runningOutterDone = false;
      const outter = input.subscribe();
      const outterPromise = outter.next();
      outterPromise.catch((e) => throwError(e));
      const { done, value } = await outterPromise;
      if (!done && value !== undefined) {
        outterCurrentValue = value;
        while (isRunningOutter) {
          const innerRunner = factory(outterCurrentValue).subscribe();
          const outterPromise = outter.next();
          outterPromise.catch((e) => throwError(e));
          runningOutter = outterPromise.then(
            (next: IteratorResult<Awaited<T> | undefined, void>) => {
              if (next.value) {
                outterCurrentValue = next.value;
              }
              if (next.done) {
                isRunningOutter = false;
              }
              runningOutterDone = true;
              return next;
            }
          );
          while (isRunningInner) {
            const innerPromise = innerRunner.next();
            innerPromise.catch((e) => throwError(e));
            const innerValue = await innerPromise;
            if (runningOutterDone) {
              const outterPromise = outter.next();
              outterPromise.catch((e) => throwError(e));
              runningOutter = outterPromise.then(
                (next: IteratorResult<Awaited<T> | undefined, void>) => {
                  if (next.value) {
                    outterCurrentValue = next.value;
                  }
                  if (next.done) {
                    isRunningOutter = false;
                  }
                  runningOutterDone = true;
                  return next;
                }
              );
            }
            if (innerValue.done) {
              isRunningInner = false;
            } else {
              yield innerValue.value as E;
            }
          }
          isRunningInner = true;
        }
      }
    });
  };

export { exhaustMap };
