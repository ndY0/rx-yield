import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const repeat: <T>(count?: number) => OperatorFunction<T, T> =
  <T>(count: number = Infinity) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      let runned = 0;
      let isRunning = true;
      try {
        while (isRunning) {
          for await (const elem of input.subscribe()) {
            if (elem !== undefined) {
              yield elem;
            } else {
              break;
            }
          }
          runned += 1;
          if (runned > count) {
            break;
          }
        }
      } catch (e) {
        throwError(e);
      }
    });
  };

export { repeat };
