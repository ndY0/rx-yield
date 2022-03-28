import { Observable } from "../observable";
import { Subject } from "../subject";
import { OperatorFunction } from "../types";

const windowWhen: <T>(
  factory: () => Observable<any>
) => OperatorFunction<T, Observable<T>> =
  <T>(factory: () => Observable<any>) =>
  (input: Observable<T>) => {
    return new Observable<Observable<T>>(async function* (throwError: (error: any) => void) {
      let innerSubject = new Subject<T>();
      let flush = false;
      let promise: Promise<any> | undefined = undefined;
      yield innerSubject;
      try {
        for await (const elem of input.subscribe()) {
          if (flush) {
            innerSubject.complete();
            innerSubject = new Subject<T>();
            yield innerSubject;
            promise = undefined;
            flush = false;
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
            await innerSubject.next(elem);
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

export { windowWhen };
