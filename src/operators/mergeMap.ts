import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const mergeMap: <T, E>(
  factory: (element: T) => Observable<E>
) => OperatorFunction<T, T | E> =
  <T, E>(factory: (element: T) => Observable<E>) =>
  (input: Observable<T>) => {
    return new Observable<E>(async function* () {
      for await (const elem of input.subscribe()) {
        if (elem !== undefined) {
          for await (const innerElem of factory(elem).subscribe()) {
            if (innerElem !== undefined) {
              yield innerElem;
            } else {
              break;
            }
          }
        } else {
          break;
        }
      }
    });
  };

export { mergeMap };
