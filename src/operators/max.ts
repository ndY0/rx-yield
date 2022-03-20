import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const max: <T>(compare: (next: T, previous: T) => number) => OperatorFunction<T, T> =
  <T, R>(compare: (next: T, previous: T) => number) =>
  (input: Observable<T>) => {
    let previous: T | undefined = undefined;
    let max: T | undefined = undefined;
    return new Observable<T>(async function* () {
      for await (const elem of input.subscribe()) {
        if (elem !== undefined) {
          if(max === undefined && previous === undefined) {
            previous = elem;
            max = elem;
          } else {
            const cmpr = compare(elem, previous as T);
            if(cmpr > 0) {
              max = elem;
            }
            previous = elem;
          }
        } else {
          break;
        }
      }
      yield max as T
    });
  };

export { max };
