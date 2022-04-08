import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const take: <T>(predicate: (elem: T) => boolean) => OperatorFunction<T, T> =
  <T>(predicate: (elem: T) => boolean) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            if (predicate(elem)) {
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
