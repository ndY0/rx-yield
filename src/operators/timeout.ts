import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const timeout: <T>(config: number | Date) => OperatorFunction<T, T> =
  <T>(config: number | Date) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      let running = true;
      let currentValue: T | undefined = undefined;
      let promise: Promise<any> | undefined = undefined;
      const runner: AsyncGenerator<
        Awaited<T>,
        void,
        unknown
      > = input.subscribe();
      const run = (runner: AsyncGenerator<Awaited<T>, void, unknown>) => {
        promise = runner
          .next()
          .then((res) => {
            if (res.done) {
              running = false;
            }
            if (res.value !== undefined) {
              currentValue = res.value;
              if (running) {
                run(runner);
              }
            }
            return res;
          })
          .catch((e) => {
            running = false;
            throwError(e);
          });
      };
      run(runner);
      while (running) {
        const res = await Promise.any(
          [
            promise,
            running
              ? new Promise<{ timeout: true }>((resolve) =>
                  setTimeout(
                    () => resolve({ timeout: true }),
                    typeof config === "number"
                      ? config
                      : Math.max(
                          0,
                          Math.round(config.getTime() - new Date().getTime())
                        )
                  )
                )
              : undefined,
          ].filter((racer) => racer !== undefined)
        );
        if (res?.timeout) {
          running = false;
          throwError(new Error(JSON.stringify({ error: "timed out" })));
        } else {
          if (currentValue) {
            yield currentValue;
          }
        }
      }
    });
  };

export { timeout };
