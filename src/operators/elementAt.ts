import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const elementAt: <T, D = T>(index: number, defaultValue?: D) => OperatorFunction<T, T | D> =
  <T, D = T>(index: number, defaultValue?: D) =>
  (input: Observable<T>) => {
    return new Observable<T | D>(async function* (
      throwError: (error: any) => void
    ) {
      let currentIndex: number = 0;
      let emitted = false;
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            if (currentIndex === index) {
              emitted = true;
              yield elem;
              break;
            }
            currentIndex += 1;
          } else {
            break;
          }
        }
        
        if(!emitted && defaultValue) {
          yield defaultValue;
        }
      } catch (e) {
        throwError(e);
      }
    });
  };

export { elementAt };
