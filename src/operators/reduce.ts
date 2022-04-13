import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const reduce: <T, R>(accumulator: (acc: R | T, element: T) => R, seed?: R) => OperatorFunction<T, R | T> =
  <T, R>(accumulator: (acc: R | T, element: T) => R, seed?: R) =>
  (input: Observable<T>) => {
    return new Observable<R | T>(async function* (
      throwError: (error: any) => void
    ) {
      let accumulated: R | T | undefined = seed;
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            if(accumulated === undefined) {
              accumulated = elem;
            } else {
              accumulated = accumulator(accumulated, elem);
            }
          } else {
            break;
          }
        }
        if(accumulated !== undefined) {
          yield accumulated
        }
      } catch (e) {
        throwError(e);
      }
    });
  };

export { reduce };
