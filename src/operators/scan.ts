import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const scan: <T, R, S>(accumulator: (acc: T | R | S, curr: T) => R, initial?: S) => OperatorFunction<T, T | R> =
  <T, R, S>(accumulator: (acc: T | R | S, curr: T) => R, initial?: S) =>
  (input: Observable<T >) => {
    return new Observable<T | R>(async function* (
      throwError: (error: any) => void
    ) {
      let state: T | R | undefined = undefined;
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            if(state === undefined && initial === undefined) {
              state = elem;
              yield elem;
              continue;
            }
            if(state === undefined && initial !== undefined) {
              state = accumulator(initial, elem);
              yield state;
              continue;
            }
            if(state !== undefined) {
              state = accumulator(state, elem);
              yield state;
            }
          } else {
            break;
          }
        }
      } catch (e) {
        throwError(e);
      }
    });
  };

export { scan };
