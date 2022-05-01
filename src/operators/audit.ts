import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const audit: <T>(
  factory: (element: T) => Observable<any>
) => OperatorFunction<T, T> =
  <T>(factory: (element: T) => Observable<any>) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (throwError: (error: any) => void) {
      let last: T | undefined = undefined;
      let promise: Promise<any> | undefined = undefined;
      let promiseInner: Promise<any> | undefined = undefined;
      let running = true;
      const runOutter = (runner: AsyncGenerator<Awaited<T>, void, unknown>) => {
        promise = runner.next().then((res) => {
          if(res.done) {
            running = false;
          }
          if(res.value !== undefined) {
            last = res.value;
            runOutter(runner)
          }
        }).catch((e) => {
          throwError(e)
        })
      }
      runOutter(input.subscribe());
      while(running) {
        await Promise.any([promise, promiseInner])
      }
      try {
        for await (const elem of input.subscribe()) {
          if (last) {
            yield last;
            promise = undefined;
            last = undefined;
          }
          if (elem !== undefined) {
            if (!promise) {
              promise = factory(elem)
                .subscribe()
                .next()
                .then(() => {
                  last = elem;
                });
            }
          } else {
            break;
          }
        }
      } catch(e) {
        throwError(e);
      }
    });
  };

export { audit };
