import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const distinct: <T>(
  cmpr: (previous: T, current: T) => boolean
) => OperatorFunction<T, T> =
  <T>(cmpr: (previous: T, current: T) => boolean) =>
  (input: Observable<T>) => {
    let previouses: T[] = [];
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            if (previouses.length === 0) {
              previouses.push(elem);
              yield elem;
            } else {
              const different = previouses.reduce((acc, curr) => acc && !cmpr(elem, curr), true);
              if (different) {
                yield elem;
                previouses.push(elem);
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

export { distinct };
