import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const map: <T, R>(factory: (element: T) => R) => OperatorFunction<T, R> =
  <T, R>(factory: (element: T) => R) =>
  (input: Observable<T>) => {
    return new Observable<R>(async function* (observer) {
      for await (const iterator of input.flow()) {
        observer.next();
      }
    }, input.observer.bufferSize);
  };
