import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const defaultIfEmpty: <T, R>(ifEmpty: R) => OperatorFunction<T, T | R> =
  <T, R>(ifEmpty: R) =>
  (input: Observable<T>) => {
    return new Observable<T | R>(async function* (throwError: (error: any) => void) {
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
          yield ifEmpty;
        }
      } catch (e) {
        throwError(e);
      }
    });
  };

export { defaultIfEmpty };
