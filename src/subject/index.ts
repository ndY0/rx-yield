import { EventEmitter } from "events";
import { FifoBuffer } from "../buffers/fifo.buffer";
import { Observable } from "../observable";
import { promisify } from "../utils";

export class Subject<T> extends Observable<T> {
  private readonly subjectEmitter: EventEmitter;
  private readonly buffer: FifoBuffer<T>;
  private readonly state: { running: boolean; error: any };
  constructor() {
    const emitter = new EventEmitter();
    const buffer = new FifoBuffer<T>(10);
    const state = { running: true, error: undefined };
    super(async function* (throwError: (error: any) => void) {
      while (state.running) {
        if (state.error) {
          throwError(state.error);
          state.running = false;
        } else {
          const data = buffer.read();
          if (data !== undefined) {
            emitter.emit("drain");
            yield data;
          } else {
            await promisify<string, void>(emitter.once.bind(emitter))("resume");
            const dataNext = buffer.read();
            if(dataNext !== undefined) {
              yield dataNext as T;
            }
          }
        }
      }
    });
    this.subjectEmitter = emitter;
    this.buffer = buffer;
    this.state = state;
  }
  async next(data: T) {
    const status = this.buffer.write(data);
    this.subjectEmitter.emit("resume");
    if (!status) {
      await promisify<string, void>(this.subjectEmitter.once.bind(this.subjectEmitter))(
        "drain"
      );
      this.buffer.write(data);
    }
  }
  error(e: any) {
    this.innerError = e;
    this.state.running = false;
    this.emitter.emit("errored");
    this.subjectEmitter.emit("resume");
  }
  complete() {
    this.state.running = false;
    this.subjectEmitter.emit("resume");
  }
}
