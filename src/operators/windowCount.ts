import { Observable } from "../observable";
import { Subject } from "../subject";
import { OperatorFunction } from "../types";
import { EventEmitter } from "events";
import { promisify } from "../utils";

const windowCount: <T>(
  bufferSize: number,
  bufferEvery?: number
) => OperatorFunction<T, Observable<T>> =
  <T>(bufferSize: number, bufferEvery?: number) =>
  (input: Observable<T>) => {
    return new Observable<Observable<T>>(async function* (
      throwError: (error: any) => void
    ) {
      let count = 1;
      let passed = bufferEvery;
      let innerSubject = new Subject<T>();
      yield innerSubject
      try {
        for await (const elem of input.subscribe()) {
          console.log(elem)
          if (passed && passed > 0) {
            passed -= 1;
            continue;
          }
          if (elem !== undefined) {
            if (count < bufferSize) {
              count += 1;
              await innerSubject.next(elem);
            } else {
              innerSubject.complete();
              innerSubject = new Subject<T>();
              yield innerSubject;
              await innerSubject.next(elem);
              count = 1;
              passed = bufferEvery;
            }
          } else {
            break;
          }
        }
        innerSubject.complete();
      } catch (e) {
        innerSubject.error(e);
        throwError(e);
      }
    });
  };

export { windowCount };
