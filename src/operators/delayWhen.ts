import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const delayWhen: <T>(delayDurationSelector: (elem: T) => Observable<any>) => OperatorFunction<T, T> =
  <T>(delayDurationSelector: (elem: T) => Observable<any>) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (throwError: (error: any) => void) {
      let running = true;
      let runningPromise = true;
      const promises: Map<number, Promise<{value?: T, error?: true, index: number}>> = new Map();
      let runnerPromise: Promise<any> | undefined = undefined;
      const run = async (runner: AsyncGenerator<Awaited<T>, void, unknown>, innerIndex: number) => {
        runnerPromise = runner.next().then((res) => {
          if(res.done) {
            running = false;
          }
          if(res.value !== undefined) {
            promises.set(innerIndex,delayDurationSelector(res.value).subscribe().next().then<{value: T, index: number}, {error: true, index: number}>((_res) => {
              return {value: res.value as T, index: innerIndex};
            }).catch((e) => {
              return {error: true as true, index: innerIndex}
            }));
            run(runner, innerIndex + 1);
          }
        }).catch((e) => {
          throwError(e);
          running = false;
        })
      }
      run(input.subscribe(), 0);
      while(running || runningPromise) {
        try {
          const res = await Promise.any(Array.from(promises.values()));
          if(res.value !== undefined) {
            yield res.value
          }
          promises.delete(res.index);
          if(! running && promises.size === 0) {
            runningPromise = false;
          }
        } catch (error) {
         await runnerPromise 
        }
      }
    });
  };

export { delayWhen };
