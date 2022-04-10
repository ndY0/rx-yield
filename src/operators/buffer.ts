import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const buffer: <T>(
  closingNotifier: Observable<any>
) => OperatorFunction<T, T[]> =
  <T>(closingNotifier: Observable<any>) =>
  (input: Observable<T>) => {
    return new Observable<T[]>(async function* (throwError: (error: any) => void) {
      let buffer: T[] = [];
      let flush = false;
      let promise: Promise<any> | undefined = undefined;
      const closingRunner = closingNotifier.subscribe();
      try {
        for await (const elem of input.subscribe()) {
          if (flush) {
            yield buffer;
            promise = undefined;
            flush = false;
            buffer = [];
          }
          if (elem !== undefined) {
            if (!promise) {
              promise = closingRunner
                .next()
                .then(() => {
                  flush = true;
                });
            }
            buffer.push(elem);
          } else {
            break;
          }
        }
        if (buffer) {
          yield buffer;
        }
      } catch(e) {
        throwError(e);
      }
    });
  };

export { buffer };
