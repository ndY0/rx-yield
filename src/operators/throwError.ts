import { Observable } from "../observable";

const throwError: <E extends Error>(factory: () => E) => Observable<any> = <
  E extends Error
>(
  factory: () => E
) =>
  new Observable<any>(async function* (throwError: (error: any) => void) {
    throwError(factory());
  });

export { throwError };
