import { EventEmitter } from "events";
import { FifoBuffer } from "../buffers/fifo.buffer";
import { share } from "../operators/share";
import { PipedObservable } from "../observable/piped";
import { promisify } from "../utils";

export class Subject<T> extends PipedObservable<T> {
  private readonly subjectEmitter: EventEmitter;
  private readonly buffer: FifoBuffer<T>;
  private readonly state: { running: boolean; error: any; ended: boolean };
  constructor(bufferSize?: number, consumerBufferSize?: number) {
    const emitter = new EventEmitter();
    const buffer = new FifoBuffer<T>(bufferSize);
    const state = { running: true, error: undefined, ended: false };
    super(async function* (throwError: (error: any) => void) {
      while (state.running) {
          const data = buffer.read();
          if (data !== undefined) {
            emitter.emit("drain");
            yield data;
          } else {
            if (!state.ended) {
              await promisify<string, void>(emitter.once.bind(emitter))(
                "resume"
              );
              const dataNext = buffer.read();
              if (dataNext !== undefined) {
                yield dataNext as T;
              }
            } else {
              state.running = false;
            }
          }
      }
    }, share(consumerBufferSize ? true : false));
    if(consumerBufferSize) {
      this.backpressureCallback = () => new FifoBuffer<T>(consumerBufferSize);
    }
    this.subjectEmitter = emitter;
    this.buffer = buffer;
    this.state = state;
  }
  async next(data: T) {
    if (!this.state.ended) {
      const status = this.buffer.write(data);
      this.subjectEmitter.emit("resume");
      if (!status) {
        await promisify<string, void>(
          this.subjectEmitter.once.bind(this.subjectEmitter)
        )("drain");
        this.buffer.write(data);
      }
    }
  }
  error(e: any) {
    this.innerError = e;
    this.state.running = false;
    this.emitter.emit("errored");
    this.subjectEmitter.emit("resume");
    this.state.ended = true;
  }
  complete() {
    this.subjectEmitter.emit("resume");
    this.state.ended = true;
  }
}
