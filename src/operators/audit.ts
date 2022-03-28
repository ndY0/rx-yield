import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const audit: <T>(
  factory: (element: T) => Observable<any>
) => OperatorFunction<T, T> =
  <T>(factory: (element: T) => Observable<any>) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (throwError: (error: any) => void) {
      let last: T | undefined = undefined;
      let promise: Promise<any> | undefined = undefined;
      try {
        for await (const elem of input.subscribe()) {
          if (last) {
            yield last;
            promise = undefined;
            last = undefined;
          }
          if (elem !== undefined) {
            if (!promise) {
              promise = factory(elem)
                .subscribe()
                .next()
                .then(() => {
                  last = elem;
                });
            }
          } else {
            break;
          }
        }
      } catch(e) {
        throwError(e);
      }
    });
  };

export { audit };
