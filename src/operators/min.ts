import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const min: <T>(
  compare: (next: T, previous: T) => number
) => OperatorFunction<T, T> =
  <T, R>(compare: (next: T, previous: T) => number) =>
  (input: Observable<T>) => {
    let previous: T | undefined = undefined;
    let min: T | undefined = undefined;
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            if (min === undefined && previous === undefined) {
              previous = elem;
              min = elem;
            } else {
              const cmpr = compare(elem, previous as T);
              if (cmpr < 0) {
                min = elem;
              }
              previous = elem;
            }
          } else {
            break;
          }
        }
        yield min as T;
      } catch (e) {
        throwError(e);
      }
    });
  };

export { min };
