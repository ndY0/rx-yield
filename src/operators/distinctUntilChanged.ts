import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const distinctUntilChanged: <T>(
  cmpr: (previous: T, current: T) => boolean
) => OperatorFunction<T, T> =
  <T>(cmpr: (previous: T, current: T) => boolean) =>
  (input: Observable<T>) => {
    let previous: T | undefined = undefined;
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            if (previous === undefined) {
              previous = elem;
              yield elem;
            } else {
              const different = !cmpr(elem, previous);
              if (different) {
                yield elem;
                previous = elem;
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

export { distinctUntilChanged };
