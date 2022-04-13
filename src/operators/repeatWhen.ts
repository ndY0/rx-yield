import { from } from "../creators/from";
import { Observable } from "../observable";
import { Subject } from "../subject";
import { OperatorFunction } from "../types";

const repeatWhen: <T>(
  notifier: (notification: Observable<T>) => Observable<any>
) => OperatorFunction<T, T> =
  <T>(notifier: (notification: Observable<T>) => Observable<any>) =>
    (input: Observable<T>) => {
      return new Observable<T>(async function* (
        throwError: (error: any) => void
      ) {
        const completionSubject = new Subject<T>();
        const notifierRunner = notifier(completionSubject).subscribe();
        let running = true;
        let error: any | undefined;
        let currentValue: T | undefined;
        let lastValue: T | undefined;
        let currentRunner: AsyncGenerator<Awaited<T>, void, unknown> | undefined;
        let runnerPromise: Promise<any> | undefined;
        const run = () => {
          if (currentRunner) {
            runnerPromise = currentRunner
              .next()
              .then((elem) => {
                if (elem.done) {
                  // running = false;
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
          console.log(running, runnerPromise, currentValue)
          if (currentValue !== undefined && error === undefined) {
            lastValue = currentValue;
            yield currentValue;
            run();
          }
          if (error !== undefined) {
            if (currentValue !== undefined) {
              yield currentValue;
            }
            throwError(error);
            running = false;
            completionSubject.complete();
          }
          console.log(currentValue, error)
          if(currentValue === undefined && error === undefined) {
            console.log(lastValue)
            await completionSubject.next(lastValue as T);
            try {
              const next = await notifierRunner.next();
              console.log("next value", next)
              if (next.done) {
                running = false;
                completionSubject.complete();
              }
              if (next.value !== undefined) {
                runnerPromise = undefined;
                currentRunner = from(input).subscribe();
                run();
              }
            } catch (error) {
              throwError(error);
              completionSubject.complete();
              running = false;
            }

          }
          currentValue = undefined;
        }
      });
    };

export { repeatWhen };
