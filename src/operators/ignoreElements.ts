import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const ignoreElements: <T>() => OperatorFunction<T, T> =
  <T>() =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
          } else {
            break;
          }
        }
      } catch (e) {
        throwError(e);
      }
    });
  };

export { ignoreElements };
