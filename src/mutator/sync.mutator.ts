import { FifoBuffer } from "../buffers/fifo.buffer";
import { Observable } from "../observable";
import { OperatorFunction } from "../types";

const Sync =
  <V extends (...args: any[]) => OperatorFunction<any, any>, T>(operator: V, bufferSize?: number, backpressureCallback?: (value: T) => void): V =>
  ((...args: Parameters<V>) =>
  (input: Observable<any>): Observable<any> => {
    const output = operator(...args)(input);
    Reflect.set(output, "bufferFactory", () => new FifoBuffer<any>(bufferSize ? bufferSize : 1));
    if(backpressureCallback) {
        Reflect.set(output, "backpressureCallback", backpressureCallback);
    }
    return output;
  }) as V;

export { Sync };
