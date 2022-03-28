import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const map: <T, R>(factory: (element: T) => R) => OperatorFunction<T, R> =
  <T, R>(factory: (element: T) => R) =>
  (input: Observable<T>) => {
    return new Observable<R>(async function* (
      throwError: (error: any) => void
    ) {
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            yield factory(elem);
          } else {
            break;
          }
        }
      } catch (e) {
        throwError(e);
      }
    });
  };

export { map };
