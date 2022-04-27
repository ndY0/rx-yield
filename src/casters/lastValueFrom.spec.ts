import { Observable } from "../observable";
import { lastValueFrom } from "./lastValueFrom";

describe("lastValueFrom", () => {
  it("should take an observable as argument, and return a promise that resolve with the last emitted value if observable complete", async () => {
    const promise = lastValueFrom(
      new Observable(async function* () {
        for (let index = 0; index < 10; index++) {
          await new Promise<void>((resolve) =>
            setTimeout(() => resolve(), 100)
          );
          yield index;
        }
      })
    );
    expect(await promise).toEqual(9);
  });
  it("should take an observable as argument, and return undefined if observable complete without emitting", async () => {
    const promise = lastValueFrom(
      new Observable(async function* () {
          await new Promise<void>((resolve) =>
            setTimeout(() => resolve(), 100)
          );
      })
    );
    expect(await promise).toEqual(undefined);
  });
  it("should take an observable as argument, and return a promise that reject with the thrown error if observable error", (done) => {
    const error = new Error("test");
    const promise = lastValueFrom(
      new Observable(async function* (throwError) {
        for (let index = 0; index < 10; index++) {
          await new Promise<void>((resolve) =>
            setTimeout(() => resolve(), 100)
          );
          if (index === 7) {
            throwError(error);
          }
          yield index;
        }
      })
    ).catch((e) => {
      expect(e).toEqual(error);
      done();
    });
  });
});
