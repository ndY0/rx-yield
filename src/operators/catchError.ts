import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const catchError: <T, E>(
  factory: (error: any) => Observable<E>
) => OperatorFunction<T, T | E> =
  <T, E>(factory: (element: any) => Observable<E>) =>
  (input: Observable<T>) => {
    return new Observable<T | E>(async function* () {
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            yield elem;
          } else {
            break;
          }
        }
      } catch (e) {
        for await (const elem of factory(e).subscribe()) {
          if (elem !== undefined) {
            yield elem;
          } else {
            break;
          }
        }
      }
    });
  };

export { catchError };
