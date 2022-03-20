import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const every: <T>(factory: (element: T) => boolean) => OperatorFunction<T, boolean> =
  <T>(factory: (element: T) => boolean) =>
  (input: Observable<T>) => {
    return new Observable<boolean>(async function* () {
        let acc = true;
      for await (const elem of input.subscribe()) {
          console.log(elem)
        if (elem !== undefined) {
          acc = acc && factory(elem);
        } else {
          break;
        }
      }
      yield acc;
    });
  };

export { every };
