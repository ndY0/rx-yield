import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const throttle: <T>(throttle: number) => OperatorFunction<T, T> =
  <T>(throttle: number) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      try {
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
      } catch (e) {
        throwError(e);
      }
    });
  };

export { throttle };
