import { Observable } from "../observable";

const from = <T>(
  input:
    | Iterable<T>
    | AsyncIterable<T>
    | Generator<T, void, unknown>
    | AsyncGenerator<T, void, unknown>
    | Promise<T>
    | Observable<T>
): Observable<T> => {
  if (input instanceof Promise) {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      try {
        yield input;
      } catch (error) {
        throwError(error);
      }
    });
  } else if (input instanceof Observable) {
    return new Observable<T>(Reflect.get(input, 'factory'));
  } else if(typeof (input as any)[Symbol.iterator] === 'function') {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      try {
        for (const elem of (input as Iterable<T> | Generator<T, void, unknown>)) {
          yield elem;
        }
      } catch (error) {
        throwError(error);
      }
    });
  } else if(typeof (input as any)[Symbol.asyncIterator] === 'function') {
    return new Observable<T>(async function* (
      throwError: (error: any) => void
    ) {
      try {
        for await (const elem of (input as AsyncIterable<T> | AsyncGenerator<T, void, unknown>)) {
          yield elem;
        }
      } catch (error) {
        throwError(error);
      }
    });
  } else {
      throw new Error(`${input} is not of iterable or Observable type`);
      
  }
};

export { from };
