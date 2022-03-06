import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const last: <T>() => OperatorFunction<T, T | void> =
  <T>() =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* () {
      let last: T | undefined;
      for await (const elem of input.subscribe()) {
        if (elem !== undefined) {
          last = elem;
        } else {
          break;
        }
      }
      console.log(last);
      if (last) {
        yield last;
      }
    });
  };

export { last };
