import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const filter: <T>(predicate: (element: T) => boolean) => OperatorFunction<T, T> =
  <T>(predicate: (element: T) => boolean) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            if(predicate(elem)) {
              yield elem;
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

export { filter };
