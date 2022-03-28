import { Observable } from "../observable";
import { OperatorFunction, TimeInterval, Timestamp } from "../types";

const timestamp: <T>() => OperatorFunction<T, Timestamp<T>> =
  <T>() =>
  (input: Observable<T>) => {
    return new Observable<Timestamp<T>>(async function* (
      throwError: (error: any) => void
    ) {
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            yield { value: elem, timestamp: new Date().getTime() };
          } else {
            break;
          }
        }
      } catch (e) {
        throwError(e);
      }
    });
  };

export { timestamp };
