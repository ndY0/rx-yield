import { Observable } from "../observable";
import { EventEmitter } from "events";
import { OperatorFunction } from "../types";
import { FifoBuffer } from "../buffers/fifo.buffer";
import { promisify } from "../utils";

const expand: <T, E>(
  factory: (element: T | E) => Observable<E>
) => OperatorFunction<T, T | E> =
  <T, E>(factory: (element: T | E) => Observable<E>) =>
  (input: Observable<T>) => {
    return new Observable<T | E>(async function* (
      throwError: (error: any) => void
    ) {
      let obsCount = 0;
      const runners: Map<
        number,
        | AsyncGenerator<Awaited<T>, void, unknown>
        | AsyncGenerator<Awaited<E>, void, unknown>
      > = new Map();
      const running: Map<number, boolean> = new Map();
      const results = new FifoBuffer<T | E>();
      const emitter = new EventEmitter();
      const run = (
        index: number,
        runner:
          | AsyncGenerator<Awaited<T>, void, unknown>
          | AsyncGenerator<Awaited<E>, void, unknown>
      ) => {
        runner
          .next()
          .then((item) => {
            if (item.done) {
              running.set(index, false);
            }
            if (item.value !== undefined) {
              results.write(item.value);
              emitter.emit("drain");
              obsCount += 1;
              const nextIndex = obsCount;
              fork(nextIndex, item.value);
              run(index, runner);
            }
            return item;
          })
          .catch((e) => {
            throwError(e);
            Array.from(running.keys()).forEach((index) =>
              running.set(index, false)
            );
          });
      };
      const fork = (index: number, elem?: T | E) => {
        const runner =
          elem === undefined ? input.subscribe() : factory(elem).subscribe();
        running.set(index, true);
        runners.set(index, runner);
        run(index, runner);
      };
      fork(obsCount);
      while (
        Array.from(running.values()).reduce(
          (acc, curr) => acc || curr,
          false
        ) ||
        results.size() > 0
      ) {
        const nextValue = results.read();
        if (nextValue !== undefined) {
          yield nextValue;
        } else {
          await promisify(emitter.once.bind(emitter))("drain");
        }
      }
    });
  };

export { expand };
