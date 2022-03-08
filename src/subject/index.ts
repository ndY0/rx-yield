import { EventEmitter } from "events";
import { FifoBuffer } from "../buffers/fifo.buffer";
import { Observable } from "../observable";
import { promisify } from "../utils";

export class Subject<T> extends Observable<T> {
  private readonly emitter: EventEmitter;
  private readonly buffer: FifoBuffer<T>;
  private readonly state: { running: boolean; error: any };
  constructor() {
    const emitter = new EventEmitter();
    const buffer = new FifoBuffer<T>(10);
    const state = { running: true, error: undefined };
    super(async function* () {
      while (state.running) {
        if (state.error) {
          throw state.error;
        } else {
          const data = buffer.read();
          if (data) {
            emitter.emit("drain");
            yield data;
          } else {
            await promisify<string, void>(emitter.once.bind(emitter))("resume");
            const dataNext = buffer.read();
            yield dataNext as T;
          }
        }
      }
    });
    this.emitter = emitter;
    this.buffer = buffer;
    this.state = state;
  }
  async next(data: T) {
    const status = this.buffer.write(data);
    this.emitter.emit("resume");
    if (!status) {
      await promisify<string, void>(this.emitter.once.bind(this.emitter))(
        "drain"
      );
      this.buffer.write(data);
    }
  }
  error(e: any) {
    this.state.error = e;
  }
  complete() {
    this.state.running = false;
  }
}
