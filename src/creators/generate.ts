import { Observable } from "../observable";

const generate = <T, U>(
  initialState: T,
  conditionFunc: (current: T) => boolean,
  stepFunction: (previous: T) => T,
  selectorFunction: (current: T) => U
): Observable<U> =>
  new Observable<U>(async function* () {
    for (
      let step = initialState;
      conditionFunc(step);
      step = stepFunction(step)
    ) {
      yield selectorFunction(step);
    }
  });

export { generate };
