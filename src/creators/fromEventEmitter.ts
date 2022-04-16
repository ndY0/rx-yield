import { EventEmitter } from "events";
import { Observable } from "../observable";
import { promisify } from "../utils";

const fromEventEmitter = <T>(
  emitter: EventEmitter,
  eventName: string
): Observable<T> =>
  new Observable<T>(async function* () {
    while (true) {
      const data = await promisify<string, T>(emitter.once.bind(emitter))(
        eventName
      );
      yield data;
    }
  });

export { fromEventEmitter };
