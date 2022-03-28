import { EventEmitter } from "events";
import { Observable } from "../observable";
import { OperatorFunction } from "../types";
import { promisify } from "../utils";

const share: <T>(blocking?: boolean) => OperatorFunction<T, T> = <T>(
  blocking: boolean = false
) => {
  const emitter = new EventEmitter();
  let running = false;
  let error: any;
  let subscriberCount = 0;
  let sharedData: T | undefined = undefined;
  const buildConsumerPromise = (event: string) =>
    new Promise<void>((resolve) => {
      let responseCount = 0;
      const sub = () => {
        responseCount += 1;
        if (responseCount === subscriberCount) {
          resolve();
          emitter.off(event, sub);
        }
      };
      emitter.on(event, sub);
    });

  return (input: Observable<T>) => {
    if (!running) {
      const source = input.subscribe();
      const runner = async () => {
        running = true;
        let runnerRunning = true;
        try {
          while (runnerRunning) {
            if (blocking) {
              await buildConsumerPromise("ready");
            }
            const data = await source.next();
            if (data.done) {
              runnerRunning = false;
            } else {
              if (blocking) {
                sharedData = data.value;
                emitter.emit("data");
                await buildConsumerPromise("consumed");
                sharedData = undefined;
              } else {
                emitter.emit("data", data.value);
              }
            }
          }
        } catch (e) {
          error = e;
          emitter.emit("data");
        }
      };
      runner();
    }
    return new Observable<T>(async function* (throwError: (error: any) => void) {
      subscriberCount += 1;
      const id = subscriberCount;
      let running = true;
      while (running) {
        let data;
        if (blocking) {
          if (sharedData) {
            data = sharedData;
          } else {
            emitter.emit("ready");
            await promisify<string, T | undefined>(emitter.once.bind(emitter))(
              "data"
            );
            data = sharedData;
            emitter.emit("consumed");
          }
        } else {
          data = await promisify<string, T | undefined>(
            emitter.once.bind(emitter)
          )("data");
        }
        if (data) {
          yield data;
        } else {
          if (error) {
            throwError(error);
          }
          running = false;
        }
      }
    });
  };
};

export { share };
