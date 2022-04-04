import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const mergeMapTo: <T>(
  innerObs: Observable<T>
) => OperatorFunction<any, T> =
  <T>(innerObs: Observable<T>) =>
  (input: Observable<any>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            for await (const innerElem of innerObs.subscribe()) {
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

export { mergeMapTo };
