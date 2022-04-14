import { Observable } from "../observable";
import { Subject } from "../subject";
import { OperatorFunction } from "../types";

const window: <T>(
  boudaries: Observable<any>
) => OperatorFunction<T, Observable<T>> =
  <T>(boudaries: Observable<any>) =>
  (input: Observable<T>) => {
    return new Observable<Observable<T>>(async function* (
      throwError: (error: any) => void
    ) {
      let innerSubject = new Subject<T>();
      let flush = false;
      let promise: Promise<any> | undefined = undefined;
      let running = true;
      const runInner = (runner: AsyncGenerator<any, void, unknown>) => {
        promise = runner.next().then((res) => {
          flush = true;
          console.log(res, running)
          if (!res.done && running) {
            runInner(runner);
          }
        }).catch(() => {});
      };
      runInner(boudaries.subscribe());
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
            await innerSubject.next(elem);
          } else {
            break;
          }
        }
        running = false;
        innerSubject.complete();
      } catch (e) {
        running = false;
        innerSubject.error(e);
        throwError(e);
      }
    });
  };

export { window };
