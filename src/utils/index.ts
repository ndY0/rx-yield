import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const pipeFromArray = <T, R>(
  fns: OperatorFunction<any, any>[]
): ((input: Observable<T>) => Observable<R>) => {
  return function piped(input: Observable<T>): Observable<R> {
    return fns.reduce(
      (prev: Observable<any>, fn: (input: Observable<T>) => Observable<R>) =>
        fn(prev),
      input as Observable<any>
    );
  };
};

export { pipeFromArray };
