import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const finalize: <T>(factory: () => void) => OperatorFunction<T, T> =
  <T>(factory: () => void) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* () {
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            yield elem;
          } else {
            break;
          }
        }
        factory();
      } catch (error) {
        factory();
      }
    });
  };

export { finalize };
