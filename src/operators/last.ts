import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const last: <T>() => OperatorFunction<T, T | void> =
  <T>() =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (throwError: (error: any) => void) {
      let last: T | undefined;
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            last = elem;
          } else {
            break;
          }
        }
        if (last) {
          yield last;
        }
      } catch (e) {
        throwError(e)
      }
    });
  };

export { last };
