import { Observable } from "../observable";
import { Notification, OperatorFunction } from "../types";

const dematerialize: <T>() => OperatorFunction<Notification<T>, T> =
  <T>() =>
  (input: Observable<Notification<T>>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            if(elem.value !== undefined) {
              yield elem.value;
              continue;
            }
            if(elem.kind === 'C') {
              break;
            }
            if(elem.error !== undefined) {
              throwError(elem.error);
            }
          } else {
            break;
          }
        }
      } catch (e) {
        throwError(e)
      }
    });
  };

export { dematerialize };
