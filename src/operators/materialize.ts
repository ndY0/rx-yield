import { Observable } from "../observable";
import { Notification, OperatorFunction } from "../types";

const materialize: <T>() => OperatorFunction<T, Notification<T>> =
  <T>() =>
  (input: Observable<T>) => {
    return new Observable<Notification<T>>(async function* () {
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            yield { kind: "N", value: elem, error: undefined, hasValue: true };
          } else {
            break;
          }
        }
        yield {
          kind: "C",
          value: undefined,
          error: undefined,
          hasValue: false,
        };
      } catch (e) {
        yield { kind: "E", value: undefined, error: e, hasValue: false };
      }
    });
  };

export { materialize };
