import { Observable } from ".";
import { PipedObservable } from "./piped";

describe("PipedObservable", () => {
  it("should apply the operator given at construction at subscription", async () => {
    const op1 =
      <T, U>(value: number) =>
      (input: Observable<T>) =>
        new Observable(async function* () {
          for await (const iterator of input.subscribe()) {
            yield value;
          }
        });
    const obs1 = new PipedObservable(async function* () {
      for (let index = 0; index < 10; index++) {
        yield index;
      }
    }, op1(10));
    const runner = obs1.subscribe()
    runner.next()
    expect(obs1).toBeInstanceOf(PipedObservable);
    for await (const iterator of runner) {
      expect(iterator).toEqual(10);
    }
  });
});
