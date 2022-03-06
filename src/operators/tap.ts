import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const tap: <T>(factory: (element: T) => void) => OperatorFunction<T, T> =
  <T>(factory: (element: T) => void) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* () {
      for await (const elem of input.subscribe()) {
        if (elem !== undefined) {
          factory(elem);
          yield elem;
        } else {
          break;
        }
      }
    });
  };

export { tap };
