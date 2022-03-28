import { Observable } from "../observable";

type OperatorFunction<T, U> = (input: Observable<T>) => Observable<U>;

type TimeInterval<T> = {value: T, interval: number};
type Timestamp<T> = {value: T, timestamp: number};

export type { OperatorFunction, TimeInterval, Timestamp };
