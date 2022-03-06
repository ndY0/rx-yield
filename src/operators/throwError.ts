import { Observable } from "../observable";

const throwError: <E extends Error>(factory: () => E) => Observable<void> = <
  E extends Error
>(
  factory: () => E
) =>
  new Observable<void>(async function* () {
    throw factory();
  });

export { throwError };
