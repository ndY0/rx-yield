import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const retry: <T>(count: number) => OperatorFunction<T, T> =
  <T>(count: number = Infinity) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* () {
      let failed = 0;
      let isRunning = true;
      while (isRunning) {
        try {
          for await (const elem of input.subscribe()) {
              console.log(elem)
            if (elem !== undefined) {
              yield elem;
            } else {
              break;
            }
          }
        } catch (e) {
            console.log(e)
          failed += 1;
          console.log(failed, count)
          if (failed > count) {
            throw e;
          }
        }
      }
    });
  };

export { retry };
