import { Observable } from "../observable";
import { ShareObservable } from "../observable/shareable";
import { OperatorFunction } from "../types";

const share: <T>() => OperatorFunction<T, T> =
  <T>() =>
  (input: Observable<T>) => {
    return new ShareObservable<T>(async function* () {
      for await (const elem of input.subscribe()) {
        if (elem !== undefined) {
          yield elem;
        } else {
          break;
        }
      }
    });
  };

export { share };
