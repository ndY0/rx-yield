import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const take: <T>(count: number) => OperatorFunction<T, T> =
  <T>(count: number) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      let emitted: number = 0;
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            if (emitted <= count) {
              emitted += 1;
              yield elem;
            } else {
              break;
            }
          } else {
            break;
          }
        }
      } catch (e) {
        throwError(e);
      }
    });
  };

export { take };
