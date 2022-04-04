import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const isEmpty: <T>() => OperatorFunction<T, boolean> =
  <T>() =>
  (input: Observable<T>) => {
    return new Observable<boolean>(async function* (throwError: (error: any) => void) {
      let isEmpty: boolean = true;
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            isEmpty = false;
            break
          } else {
            break;
          }
        }
      } catch (e) {
        throwError(e)
      }
      yield isEmpty
    });
  };

export { isEmpty };
