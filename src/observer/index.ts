import { EventEmitter } from "events";
import { promisify } from "util";
import { FifoBuffer } from "../buffers/fifo.buffer";
import { IBuffer } from "../interfaces/buffer.interface";

export class Observer<
  T,
  U extends {
    new (...args: any[]): IBuffer<T>;
  }
> implements AsyncIterable<T>
{
  private readonly buffer: InstanceType<U>;
  public readonly bufferSize: number;
  private closed = false;
  private readonly emitter: EventEmitter = new EventEmitter();
  constructor(bufferSize?: number, buffer?: U) {
    this.bufferSize = bufferSize || 1000;
    this.buffer = new (buffer ? buffer : FifoBuffer)(
      bufferSize || 1000
    ) as InstanceType<U>;
  }
  [Symbol.asyncIterator](): AsyncIterator<T, void, undefined> {
    return ((self: Observer<T, U>) => ({
      async next() {
        const dataOrUndefined = self.buffer.read();
        if (dataOrUndefined) {
          return {
            done: false,
            value: dataOrUndefined,
          } as IteratorYieldResult<T>;
        } else {
          if (self.closed) {
            return {
              done: true,
            } as IteratorReturnResult<void>;
          }
          const ended: boolean = await promisify(
            self.emitter.once.bind(self.emitter)
          )("drain");
          if (ended) {
            return {
              done: true,
            } as IteratorReturnResult<void>;
          } else {
            return {
              done: false,
              value: self.buffer.read(),
            } as IteratorYieldResult<T>;
          }
        }
      },
      async return(_?: void | PromiseLike<void>) {
        self.emitter.removeAllListeners();
        self.buffer.flush();
        return {
          done: true,
        } as IteratorReturnResult<void>;
      },
      async throw(e?: any) {
        return {
          done: true,
          value: e,
        };
      },
    }))(this);
  }
  next(elem: T): boolean {
    if (this.buffer.size() === 0) {
      const result = this.buffer.write(elem);
      this.emitter.emit("drain", false);
      return result;
    } else {
      return this.buffer.write(elem);
    }
  }
  complete() {
    this.emitter.emit("drain", true);
  }
  throw(error: any) {}
}
