import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const bufferWhen: <T>(
  factory: () => Observable<any>
) => OperatorFunction<T, T[]> =
  <T>(factory: () => Observable<any>) =>
  (input: Observable<T>) => {
    return new Observable<T[]>(async function* () {
      let buffer: T[] = [];
      let flush = false;
      let promise: Promise<any> | undefined = undefined;
      for await (const elem of input.subscribe()) {
        if (flush) {
          yield buffer;
          promise = undefined;
          flush = false;
          buffer = [];
        }
        if (elem !== undefined) {
          if (!promise) {
            promise = factory()
              .subscribe()
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
    });
  };

export { bufferWhen };
