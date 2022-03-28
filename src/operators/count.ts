import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const count: <T>() => OperatorFunction<T, number> =
  <T>() =>
  (input: Observable<T>) => {
    return new Observable<number>(async function* (throwError: (error: any) => void) {
      let count = 0;
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            count += 1;
          } else {
            break;
          }
        }
        yield count;
      } catch(e) {
        throwError(e);
      }
    });
  };

export { count };
