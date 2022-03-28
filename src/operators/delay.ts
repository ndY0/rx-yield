import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const delay: <T>(timeout: number | Date) => OperatorFunction<T, T> =
  <T>(timeout: number | Date) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (throwError: (error: any) => void) {
      await new Promise<void>((resolve) =>
        setTimeout(
          () => resolve(),
          typeof timeout === "number"
            ? timeout
            : Math.round(
                Math.max(new Date().getTime() - timeout.getTime(), 0) / 1000
              )
        )
      );
      try {
        for await (const elem of input.subscribe()) {
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

export { delay };
