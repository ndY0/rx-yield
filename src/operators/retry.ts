import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const retry: <T>(count: number) => OperatorFunction<T, T> =
  <T>(count: number = Infinity) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      let failed = 0;
      let isRunning = true;
      while (isRunning) {
        try {
          for await (const elem of input.subscribe()) {
            if (elem !== undefined) {
              yield elem;
            } else {
              break;
            }
          }
        } catch (e) {
          failed += 1;
          if (failed > count) {
            throwError(e);
          }
        }
      }
    });
  };

export { retry };
