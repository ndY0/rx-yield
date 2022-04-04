import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const find: <T>(predicate: (value: T, index: number) => boolean) => OperatorFunction<T, T | void> =
  <T>(predicate: (value: T, index: number) => boolean) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      let count: number = 0;
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            if (predicate(elem, count)) {
              yield elem;
              break;
            } else {
              count += 1
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

export { find };
