import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const debounce: <T>(
  factory: (value: T) => Observable<any>
) => OperatorFunction<T, T> =
  <T>(factory: (value: T) => Observable<any>) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      let current: T | undefined;
      let running = true;
      let outterRunner = input.subscribe();
      let innerRunner: AsyncGenerator<Awaited<any>, void, unknown> | undefined;
      let outterPromise: Promise<{inner: boolean, error?: boolean}> | undefined;
      let innerPromise: Promise<{inner: boolean, error?: boolean}> | undefined;
      const run = () => {
        outterPromise = outterRunner.next().then((result) => {
          if(result.done) {
            running = false;
            return {inner: false}
          }
          if(result.value !== undefined) {
            current = result.value;
            innerRunner = factory(result.value).subscribe();
            innerPromise = innerRunner.next().then(() => {
              return {inner: true}
            }).catch(() => {
              return {inner: true, error: true}
            });
            run();
          }
          return {inner: false};
        }).catch((e) => {
          throwError(e);
          running = false;
          return {inner: false, error: true}
        })
      }
      run();
      while(running) {
        const res = await Promise.any([innerPromise, outterPromise].filter((promise => promise !== undefined)));
        if(res && res.inner && !res.error) {
          yield current as T;
          await outterPromise
          if(! running) {
            await innerPromise
            yield current as T
          }
        } else if(res && res.inner && res.error) {
          await outterPromise
          if(! running) {
            await innerPromise
            yield current as T
          }
        }
      }
    });
  };

export { debounce };
