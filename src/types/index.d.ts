import { Observable } from "../observable";

type OperatorFunction<T, U> = (input: Observable<T>) => Observable<U>;

export type { OperatorFunction };
