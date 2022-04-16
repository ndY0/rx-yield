import { Observable } from "../observable";

const of = <A extends any[], E>(
  ...inputs: A
): Observable<A extends (infer E)[] ? E : A> =>
  new Observable<A extends (infer E)[] ? E : A>(async function* () {
    for (const elem of inputs) {
      yield elem;
    }
  });

export { of };
