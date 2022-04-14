import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const single: <T>(factory: (element: T) => boolean) => OperatorFunction<T, T> =
  <T>(factory: (element: T) => boolean) =>
  (input: Observable<T>) => {
    return new Observable<T>(async function* (throwError: (error: any) => void) {
        let matched = false;
        let value: T | undefined = undefined;
        try {

          for await (const elem of input.subscribe()) {
            if (elem !== undefined) {
              if(factory(elem)) {
                if(matched) {
                  throwError(new Error('Too many value match'))
                  break;
                } else {
                  matched = true;
                  value = elem;
                }
              }
            } else {
              break;
            }
          }
          if(!matched) {
            throwError(new Error('No values match'))
          } else {
            if(value !== undefined) {
              yield value
            }
          }
        } catch (e) {
          throwError(e);
        }
    });
  };

export { single };
