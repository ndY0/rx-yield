import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const skipWhile: <T>(
  evaluate: (elem: T) => boolean
) => OperatorFunction<T, T | void> =
  <T>(evaluate: (elem: T) => boolean) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* () {
      let pass = true;
      for await (const elem of input.subscribe()) {
        if (elem !== undefined) {
          if (!pass || !evaluate(elem)) {
            if (pass) {
              pass = false;
            }
            yield elem;
          }
        } else {
          break;
        }
      }
    });
  };

export { skipWhile };
