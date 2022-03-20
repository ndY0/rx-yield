import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const bufferTime: <T>(bufferTimeSpan: number) => OperatorFunction<T, T[]> =
  <T>(bufferTimeSpan: number) =>
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
            promise = new Promise<void>((resolve) => {
              setTimeout(() => {
                resolve();
              }, bufferTimeSpan);
            }).then(() => {
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

export { bufferTime };
