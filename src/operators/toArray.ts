import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const toArray: <T>() => OperatorFunction<T, T[]> =
  <T>() =>
  (input: Observable<T>) => {
    return new Observable<T[]>(async function* (
      throwError: (error: any) => void
    ) {
      const values: T[] = [];
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            values.push(elem)
          } else {
            break;
          }
        }
        yield values;
      } catch (e) {
        throwError(e);
      }
    });
  };

export { toArray };
