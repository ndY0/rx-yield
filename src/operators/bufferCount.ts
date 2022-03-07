import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const bufferCount: <T>(
  bufferSize: number,
  bufferEvery?: number
) => OperatorFunction<T, T[]> =
  <T>(bufferSize: number, bufferEvery?: number) =>
  (input: Observable<T>) => {
    return new Observable<T[]>(async function* () {
      let buffer: T[] = [];
      let passed = bufferEvery;
      for await (const elem of input.subscribe()) {
        if (passed && passed > 0) {
          passed -= 1;
          continue;
        }
        if (elem !== undefined) {
          if (buffer.length < bufferSize - 1) {
            buffer.push(elem);
          } else {
            buffer.push(elem);
            yield buffer;
            buffer = [];
            passed = bufferEvery;
          }
        } else {
          break;
        }
      }
      if (buffer.length > 0) {
        yield buffer;
      }
    });
  };

export { bufferCount };
