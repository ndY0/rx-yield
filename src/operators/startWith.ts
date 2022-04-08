import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const startWith: <T, R>(...values: R[]) => OperatorFunction<T, T | R> =
  <T, R>(...values: R[]) =>
  (input: Observable<T>) => {
    return new Observable<T | R>(async function* (
      throwError: (error: any) => void
    ) {
      try {
        for (const elem of values) {
          yield elem;
        }
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            yield elem;
          } else {
            break;
          }
        }
      } catch (e) {
        throwError(e);
      }
    });
  };

export { startWith };
