import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const ignoreElements: <T>() => OperatorFunction<T, T> =
  <T>() =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* () {
      for await (const elem of input.subscribe()) {
        if (elem !== undefined) {
        } else {
          break;
        }
      }
    });
  };

export { ignoreElements };
