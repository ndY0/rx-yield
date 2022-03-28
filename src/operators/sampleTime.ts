import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const sampleTime: <T>(period: number) => OperatorFunction<T, T> =
  <T>(period: number) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      let sample: T | undefined = undefined;
      let flush = false;
      let promise: Promise<any> | undefined = undefined;
      try {
        for await (const elem of input.subscribe()) {
          if (flush && sample) {
            yield sample;
            promise = undefined;
            flush = false;
            sample = undefined;
          }
          if (elem !== undefined) {
            if (!promise) {
              promise = new Promise<void>((resolve) => {
                setTimeout(() => {
                  resolve();
                }, period);
              }).then(() => {
                flush = true;
              });
            }
            sample = elem;
          } else {
            break;
          }
        }
        if (sample) {
          yield sample;
        }
      } catch (e) {
        throwError(e);
      }
    });
  };

export { sampleTime };
