import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const concatMapTo: <T, E>(
  innerSource: Observable<E>
) => OperatorFunction<T, E> =
  <T, E>(innerSource: Observable<E>) =>
  (input: Observable<T>) => {
    return new Observable<E>(async function* (throwError: (error: any) => void) {
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            for await (const innerElem of innerSource.subscribe()) {
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
      } catch (e) {
        throwError(e);
      }
    });
  };

export { concatMapTo };
