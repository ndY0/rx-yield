import { Observable } from "../observable";

type OperatorFunction<T, U> = (input: Observable<T>) => Observable<U>;

type TimeInterval<T> = {value: T, interval: number};
type Timestamp<T> = {value: T, timestamp: number};
type Notification<T> = {kind: "N" | "E" | "C", value?: T, error?: any, hasValue: boolean}

export type { OperatorFunction, TimeInterval, Timestamp, Notification };
