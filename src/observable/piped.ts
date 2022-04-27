import { Observable } from ".";
import { OperatorFunction } from "../types";

export class PipedObservable<T> extends Observable<T> {
    readonly _operator: OperatorFunction<T, T>;
    constructor(factory: (throwError: (error: any) => void) => AsyncGenerator<T, void, void>, operator: OperatorFunction<T, T>) {
        super(factory);
        this._operator = operator;
    }
    async *subscribe(): AsyncGenerator<Awaited<T>, void, unknown> {
      yield * Observable.prototype.subscribe.bind(super.pipe.bind({...this, subscribe: Observable.prototype.subscribe.bind(this)})(this._operator))()
    }
  };
