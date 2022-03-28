import { Observable } from "../observable";
import { OperatorFunction, TimeInterval } from "../types";

const timeInterval: <T>() => OperatorFunction<T, TimeInterval<T>> =
  <T>() =>
  (input: Observable<T>) => {
    return new Observable<TimeInterval<T>>(async function* (
      throwError: (error: any) => void
    ) {
      let previousTimestamp: number | undefined = undefined;
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            const now = new Date().getTime();
            if (previousTimestamp === undefined) {
              previousTimestamp = now;
            }
            yield { value: elem, interval: now - previousTimestamp };
            previousTimestamp = now;
          } else {
            break;
          }
        }
      } catch (e) {
        throwError(e);
      }
    });
  };

export { timeInterval };
