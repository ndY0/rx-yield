import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const skipUntil: <T>(
  notifier: Observable<any>
) => OperatorFunction<T, T | void> =
  <T>(notifier: Observable<any>) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      let skip = true;
      notifier
        .subscribe()
        .next()
        .then(() => {
          skip = false;
        })
        .catch(() => {});
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            if (!skip) {
              yield elem;
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

export { skipUntil };
