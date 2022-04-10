import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const bufferToggle: <T, O>(
  openings: Observable<O>,
  closingSelector: (value: O) => Observable<any>
) => OperatorFunction<T, T[]> =
  <T, O>(
    openings: Observable<O>,
    closingSelector: (value: O) => Observable<any>
  ) =>
  (input: Observable<T>) => {
    return new Observable<T[]>(async function* (
      throwError: (error: any) => void
    ) {
      let buffer: T[] = [];
      let flush = false;
      let pass = true;
      let promise: Promise<any> | undefined = undefined;
      let running = true;
      const openingsRunner = openings.subscribe();
      const run = () => {
        openingsRunner
          .next()
          .then((res) => {
            if (res.done) {
              running = false;
            }
            if (res.value !== undefined) {
              pass = false;
              closingSelector(res.value)
                .subscribe()
                .next()
                .then((res) => {
                  flush = true;
                  pass = true;
                })
                .catch((e) => {
                  throwError(e);
                  running = false;
                });
                if(running) {
                  run();
                }
            }
          })
          .catch((e) => {
            throwError(e);
            running = false;
          });
      };
      run();
      try {
        for await (const elem of input.subscribe()) {
          if (!running) {
            break;
          }
          if (flush) {
            yield buffer;
            promise = undefined;
            flush = false;
            buffer = [];
          }
          if (elem !== undefined) {
            if (pass) {
              continue;
            }
            buffer.push(elem);
          } else {
            break;
          }
        }
        if (buffer) {
          yield buffer;
        }
      } catch (e) {
        throwError(e);
      }
    });
  };

export { bufferToggle };
