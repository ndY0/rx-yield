import { FifoBuffer } from "../buffers/fifo.buffer";
import { Observable } from "../observable";

const puppet = <T>(
  observable: Observable<T>,
  bufferSize?: number,
  backpressureCallback?: (value: T) => void
): Observable<T> => {
  Reflect.set(
    observable,
    "bufferFactory",
    () => new FifoBuffer<any>(bufferSize ? bufferSize : 1)
  );
  if (backpressureCallback) {
    Reflect.set(observable, "backpressureCallback", backpressureCallback);
  }
  return observable;
};

export { puppet };
