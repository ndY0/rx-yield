import { Observable } from "../observable";
import { Subject } from "../subject";
import { OperatorFunction } from "../types";

const windowToggle: <T, R>(
  openings: Observable<R>, closingSelector: (openElem: R) => Observable<any>
) => OperatorFunction<T, Observable<T>> =
  <T, R>(openings: Observable<R>, closingSelector: (openElem: R) => Observable<any>) =>
  (input: Observable<T>) => {
    return new Observable<Observable<T>>(async function* (
      throwError: (error: any) => void
    ) {
      let innerSubject: Subject<T> | undefined = new Subject<T>();
      let open = false;
      let close = false;
      let running = true;
      const runInner = (runner: AsyncGenerator<Awaited<R>, void, unknown>) => {
        runner.next().then((res) => {
          open = true;
          if(res.value !== undefined && running) {
            forkClosing(res.value);
          }
          if (!res.done && running) {
            runInner(runner);
          }
        }).catch(() => {});
      };
      const runClosing = (runner: AsyncGenerator<Awaited<R>, void, unknown>) => {
        runner.next().then((res) => {
          if(res.done) {
            close = true;
          }
          if(!res.done && running) {
            runClosing(runner)
          }
        }).catch(() => {})
      }
      const forkClosing = (opening: R) => {
        runClosing(closingSelector(opening).subscribe())
      }
      runInner(openings.subscribe());
      yield innerSubject;
      try {
        for await (const elem of input.subscribe()) {

          if (open && innerSubject === undefined) {
            innerSubject = new Subject<T>();
            yield innerSubject;
            open = false;
            close = false;
          }
          if(close && innerSubject !== undefined) {
            innerSubject.complete();
            innerSubject = undefined;
            close = false
            open = false
          }
          if (elem !== undefined && innerSubject) {
            innerSubject.next(elem);
          }
        }
        running = false;
        if(innerSubject !== undefined) {
          innerSubject.complete();
        }
      } catch (e) {
        running = false;
        if(innerSubject !== undefined) {
          innerSubject.error(e);
        }
        throwError(e);
      }
    });
  };

export { windowToggle };
