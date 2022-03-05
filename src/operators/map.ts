import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const map: <T, R>(factory: (element: T) => R) => OperatorFunction<T, R> =
  <T, R>(factory: (element: T) => R) =>
  (input: Observable<T>) => {
    return new Observable<R>(async function* (observer) {
      for await (const elem of input.flow()) {
        yield factory(elem);
        observer.next();
      }
    }, input.observer.bufferSize);
  };

export { map };
