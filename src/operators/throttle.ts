import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const throttle: <T>(durationSelector: (elem: T) => Observable<any>) => OperatorFunction<T, T> =
  <T>(durationSelector: (elem: T) => Observable<any>) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      let currentValue: T | undefined = undefined;
      let promise: Promise<any> | undefined = undefined;
      let throttleRunner:  AsyncGenerator<any, void, unknown> | undefined = undefined;
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
              throttleRunner = durationSelector(res.value).subscribe();
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
          if(throttleRunner !== undefined) {
            await (throttleRunner as any).next();
          }
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

export { throttle };
