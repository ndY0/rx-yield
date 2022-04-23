import { FifoBuffer } from "../buffers/fifo.buffer";
import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const takeLast: <T>(count: number) => OperatorFunction<T, T | void> =
  <T>(count: number) =>
  (input: Observable<T>) => {
    return new Observable<T | void>(async function* (throwError: (error: any) => void) {
      let last: T | undefined;
      const lasts = new FifoBuffer<T>(count);
      let running = true;
      try {
        for await (const elem of input.subscribe()) {
          if (elem !== undefined) {
            const status = lasts.write(elem);
            if(!status) {
              lasts.read();
              lasts.write(elem);
            }
            last = elem;
          } else {
            break;
          }
        }
        while(running) {
          const data = lasts.read();
          if(data) {
            yield data;
          } else {
            running = false;
          }
        }
      } catch (e) {
        throwError(e)
      }
    });
  };

export { takeLast };
