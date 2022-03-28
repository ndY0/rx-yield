import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const first: <T>() => OperatorFunction<T, T | void> =
  <T>() =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      try {
        const runner = input.subscribe();
        const { done, value } = await runner.next();
        if (value !== undefined) {
          yield value;
        }
      } catch (e) {
        throwError(e);
      }
    });
  };

export { first };
