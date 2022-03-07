import { EventEmitter } from "events";
import { v1 } from "uuid";
import { Observable } from "../observable";
import { OperatorFunction } from "../types";
import { promisify } from "../utils";

const share: <T>() => OperatorFunction<T, T> = <T>() => {
  const emitter = new EventEmitter();
  let running = false;
  let error: any;
  return (input: Observable<T>) => {
    if (!running) {
      const source = input.subscribe();
      const runner = async () => {
        running = true;
        let runnerRunning = true;
        try {
          while (runnerRunning) {
            const data = await source.next();
            if (data.done) {
              runnerRunning = false;
            } else {
              emitter.emit("data", data.value);
            }
          }
        } catch (e) {
          error = e;
          emitter.emit("data");
        }
      };
      runner();
    }
    return new Observable<T>(async function* () {
      let running = true;
      while (running) {
        const data = await promisify<string, T | undefined>(
          emitter.once.bind(emitter)
        )("data");
        if (data) {
          yield data;
        } else {
          if (error) {
            throw error;
          }
          running = false;
        }
      }
    });
  };
};

export { share };
