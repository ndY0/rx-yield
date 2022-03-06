import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const throttle: <T>(throttle: number) => OperatorFunction<T, T> =
  <T>(throttle: number) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* () {
      for await (const elem of input.subscribe()) {
        await new Promise<void>((resolve) =>
          setTimeout(() => resolve(), throttle)
        );
        if (elem !== undefined) {
          yield elem;
        } else {
          break;
        }
      }
    });
  };

export { throttle };
