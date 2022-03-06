import { EventEmitter } from "events";
import { promisify } from "util";
import { Observable } from ".";
import { FifoBuffer } from "../buffers/fifo.buffer";

export class ShareObservable<T> extends Observable<T> {
  private subscribersCount = 0;
  private batchSubscriberDelivered = 0;
  private readonly sharedSource: AsyncGenerator<T, void, void>;
  constructor(factory: () => AsyncGenerator<T, void, void>) {
    super(factory);
    this.sharedSource = factory();
  }
  async *subscribe() {
    const observer = new EventEmitter();
    const buffer = new FifoBuffer<T>(1000);
    const source = this.sharedSource;
    let runningRead = true;
    let runningWrite = true;
    let error: any = undefined;
    let lastRead: T | undefined = undefined;
    const runner = async () => {
      if (this.subscribersCount === 0) {
        try {
          while (runningWrite) {
            const data = await source.next();
            if (data.done) {
              runningWrite = false;
            } else {
              const permitted = buffer.write(data.value);
              observer.emit("drain");
              if (!permitted) {
                await promisify(observer.once.bind(observer))("resume");
                buffer.write(data.value);
              }
            }
          }
        } catch (e) {
          error = e;
          observer.emit("drain");
        }
      }
    };
    runner();
    this.subscribersCount += 1;
    while (runningRead) {
      let data;
      console.log(this.subscribersCount, this.batchSubscriberDelivered);
      if (this.subscribersCount === this.batchSubscriberDelivered) {
        data = buffer.read();
        if (data) {
          lastRead = data;
          this.batchSubscriberDelivered = 0;
        }
      } else {
        if (lastRead) {
          this.batchSubscriberDelivered += 1;
          yield lastRead;
          continue;
        }
      }
      observer.emit("resume");
      if (data) {
        yield data;
      } else {
        if (runningWrite) {
          await promisify(observer.once.bind(observer))("drain");
          if (error) {
            this.subscribersCount -= 1;
            throw error;
          }
          const next = buffer.read();
          this.batchSubscriberDelivered += 1;
          lastRead = next;
          yield next;
        } else {
          runningRead = false;
        }
      }
    }
    this.subscribersCount -= 1;
  }
}
