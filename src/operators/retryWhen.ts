import { from } from "../creators/from";
import { Observable } from "../observable";
import { Subject } from "../subject";
import { OperatorFunction } from "../types";

const retryWhen: <T>(
  notifier: (errors: Observable<any>) => Observable<any>
) => OperatorFunction<T, T> =
  <T>(notifier: (errors: Observable<any>) => Observable<any>) =>
    (input: Observable<T>) => {
      return new Observable<T>(async function* (
        throwError: (error: any) => void
      ) {
        const errorsSubject = new Subject();
        const notifierRunner = notifier(errorsSubject).subscribe();
        let running = true;
        let error: any | undefined;
        let currentValue: T | undefined;
        let currentRunner: AsyncGenerator<Awaited<T>, void, unknown> | undefined;
        let runnerPromise: Promise<any> | undefined;
        const run = () => {
          if (currentRunner) {
            runnerPromise = currentRunner
              .next()
              .then((elem) => {
                if (elem.done) {
                  running = false;
                }
                if (elem.value !== undefined) {
                  currentValue = elem.value;
                }
              })
              .catch((e) => {
                error = e;
              });
          }
        };
        currentRunner = from(input).subscribe();
        run();
        while (running) {
          await runnerPromise;
          if (currentValue !== undefined && error === undefined) {
            yield currentValue;
            run();
          }
          if (currentValue === undefined && error === undefined) {
            running = false;
          }
          currentValue = undefined;
          if (error !== undefined) {
            if (currentValue !== undefined) {
              yield currentValue;
            }
            await errorsSubject.next(error);
            try {
              const next = await notifierRunner.next();
              if (next.done) {
                running = false;
                errorsSubject.complete();
              }
              if (next.value !== undefined) {
                runnerPromise = undefined;
                currentRunner = from(input).subscribe();
                run();
              }

              error = undefined;
            } catch (error) {
              throwError(error);
              errorsSubject.complete();
              running = false;
            }
          }
        }
      });
    };

export { retryWhen };
