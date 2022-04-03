import { EventEmitter } from "events";
import { Observable } from ".";
import { OperatorFunction } from "../types";

export class PipedObservable<T> extends Observable<T> {
    readonly _operator: OperatorFunction<T, T>;
    readonly _innerRunner: AsyncGenerator<Awaited<T>, void, unknown>
    constructor(factory: (throwError: (error: any) => void) => AsyncGenerator<T, void, void>, operator: OperatorFunction<T, T>) {
        super(factory);
        this._operator = operator;
        this._innerRunner = super.pipe(this._operator).subscribe();
    }
    async *subscribe(): AsyncGenerator<Awaited<T>, void, unknown> {
      if(this._innerRunner !== undefined) {
        yield * this._innerRunner;
      } else {
        yield * super.subscribe()
      }
    }
  };
