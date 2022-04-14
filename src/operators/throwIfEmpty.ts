import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const throwIfEmpty: <T>(errorFactory: () => any) => OperatorFunction<T, T> =
  <T>(errorFactory: () => any) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (throwError: (error: any) => void) {
      let last: T | undefined;
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            last = elem;
            yield elem;
          } else {
            break;
          }
        }
        if (!last) {
          throwError(errorFactory())
        }
      } catch (e) {
        throwError(e);
      }
    });
  };

export { throwIfEmpty };
