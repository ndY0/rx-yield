import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const exhaustMap: <T, E>(
  factory: (element: T) => Observable<E>
) => OperatorFunction<T, E> =
  <T, E>(factory: (element: T) => Observable<E>) =>
  (input: Observable<T>) => {
    return new Observable<E>(async function* () {
      let isRunningOutter = true;
      let isRunningInner = true;
      let outterCurrentValue: T | undefined = undefined;
      let runningOutter: Promise<IteratorResult<Awaited<T> | undefined, void>> | undefined = undefined;
      let runningOutterDone = false;
      const outter = input.subscribe();
      const { done, value } = await outter.next();
      if (! done && value !== undefined) {
        console.log(value, done, "in init")
        outterCurrentValue = value
        while (isRunningOutter) {
          console.log(outterCurrentValue, "outter current value")
          const innerRunner = factory(outterCurrentValue).subscribe()
          runningOutter = outter.next().then((next: IteratorResult<Awaited<T> | undefined, void>) => {
            if(next.value) {
              outterCurrentValue = next.value
            }
            if(next.done) {
              isRunningOutter = false;
            }
            runningOutterDone = true;
            return next
          });
          while(isRunningInner) {
            const test = await innerRunner.next();
            if(runningOutterDone) {
              runningOutter = outter.next().then((next: IteratorResult<Awaited<T> | undefined, void>) => {
                if(next.value) {
                  outterCurrentValue = next.value
                }
                if(next.done) {
                  isRunningOutter = false;
                }
                runningOutterDone = true;
                return next
              });
            }
            if(test.done) {
              isRunningInner = false;
            } else {
              yield test.value as E
            }
          }
          console.log(isRunningOutter, "is running main");
          isRunningInner = true;
        }
      }
    });
  };

export { exhaustMap };
