import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const throttleTime: <T>(throttle: number) => OperatorFunction<T, T> =
  <T>(throttle: number) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      let currentValue: T | undefined = undefined;
      let promise: Promise<any> | undefined = undefined;
      let shouldWaitNext = false;
      let running = true;
      const run = (runner: AsyncGenerator<Awaited<T>, void, unknown>) => {
        promise = runner
          .next()
          .then((res) => {
            if (res.done) {
              running = false;
            }
            if (res.value !== undefined) {
              currentValue = res.value;
              run(runner);
            }
          })
          .catch((e) => {
            running = false;
            throwError(e);
          });
      };
      const runner = input.subscribe();
      run(runner);
        await promise;
      if(currentValue !== undefined) {
        yield currentValue;
        currentValue = undefined;
      }
      while (running) {
        if(shouldWaitNext) {
          await new Promise<void>((resolve) =>
            setTimeout(() => resolve(), throttle)
          );
        } else {
          shouldWaitNext = true;
        }
        if(currentValue !== undefined) {
          yield currentValue;
          currentValue = undefined;
        } else {
          shouldWaitNext = false
          await promise
        }
      }
    });
  };

export { throttleTime };
