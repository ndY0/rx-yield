import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const mapTo: <T>(value: T) => OperatorFunction<any, T> =
  <T>(value: T) =>
  (input: Observable<any>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            yield value;
          } else {
            break;
          }
        }
      } catch (e) {
        throwError(e);
      }
    });
  };

export { mapTo };
