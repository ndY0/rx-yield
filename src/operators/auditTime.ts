import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const auditTime: <T>(
  duration: number
) => OperatorFunction<T, T> =
  <T>(duration: number) =>
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
              promise = new Promise<void>((resolve) => setTimeout(() => resolve(), duration))
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

export { auditTime };
