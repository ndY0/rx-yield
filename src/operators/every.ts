import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const every: <T>(factory: (element: T) => boolean) => OperatorFunction<T, boolean> =
  <T>(factory: (element: T) => boolean) =>
  (input: Observable<T>) => {
    return new Observable<boolean>(async function* (throwError: (error: any) => void) {
        let acc = true;
        try {
          for await (const elem of input.subscribe()) {
            if (elem !== undefined) {
              acc = acc && factory(elem);
            } else {
              break;
            }
          }
          yield acc;
        } catch (e) {
          throwError(e);
        }
    });
  };

export { every };
