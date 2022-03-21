import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const skip: <T>(count: number) => OperatorFunction<T, T | void> =
  <T>(count: number) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* () {
      let skipped: number = 0;
      for await (const elem of input.subscribe()) {
        if (elem !== undefined) {
          if(skipped <= count) {
            skipped += 1
          } else {
            yield elem
          }
        } else {
          break;
        }
      }
    });
  };

export { skip };
