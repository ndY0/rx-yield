import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const concatAll: <T>() => OperatorFunction<Observable<T>, T> = <
  T
>(): OperatorFunction<Observable<T>, T> => {
  return (input: Observable<Observable<T>>) => {
    return new Observable<any>(async function* (
      throwError: (error: any) => void
    ) {
      const runners = new Map<
        number,
        AsyncGenerator<Awaited<T>, void, unknown>
      >();
      let index = 0;
      let running = true;
      try {
        for await (const innerSource of input.subscribe()) {
          runners.set(index, innerSource.subscribe());
          index += 1;
        }
      } catch (e) {
        throwError(e);
        running = false;
      }
      try {
        for (const [_, runner] of runners) {
          for await (const elem of runner) {
            yield elem
          }
        }
      } catch (error) {
        throwError(error);
      }
    });
  };
};

export { concatAll };
