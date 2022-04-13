import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const pairwise: <T>() => OperatorFunction<T, [T, T]> =
  <T>() =>
  (input: Observable<T>) => {
    return new Observable<[T, T]>(async function* (
      throwError: (error: any) => void
    ) {
      let last: T | undefined;
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            if (last !== undefined) {
              yield [last, elem];
            }
            last = elem;
          } else {
            break;
          }
        }
      } catch (e) {
        throwError(e);
      }
    });
  };

export { pairwise };
