import { FifoBuffer } from "../buffers/fifo.buffer";
import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const skipLast: <T>(count: number) => OperatorFunction<T, T | void> =
  <T>(count: number) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      let skipped: number = 0;
      const buffer = new FifoBuffer<T>();
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            if (skipped <= count) {
              skipped += 1;
              buffer.write(elem);
            } else {
              buffer.write(elem);
              yield buffer.read() as T;
            }
          } else {
            break;
          }
        }
      } catch (e) {
        if(buffer.size() > count) {
          while (buffer.size() > count) {
            yield buffer.read() as T
          }
        }
        throwError(e);
      }
    });
  };

export { skipLast };
