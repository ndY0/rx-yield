import { Observable } from "../observable";
import { from } from "./from";

describe("from", () => {
  it("should create an Observable from an iterable", async () => {
    let index = 1;
    for await (const iterator of from([1, 2, 3, 4]).subscribe()) {
      expect(iterator).toEqual(index);
      index += 1;
    }
  });
  it("should create an Observable from a generator", async () => {
    let index = 1;
    for await (const iterator of from(
      (function* () {
        for (let index = 1; index < 5; index++) {
          yield index;
        }
      })()
    ).subscribe()) {
      expect(iterator).toEqual(index);
      index += 1;
    }
  });
  it("should create an Observable from a generator and catch any exception", async () => {
    const error = new Error("test");
    try {
      for await (const iterator of from(
        (function* () {
          throw error;
        })()
      ).subscribe()) {
      }
    } catch (errorPassed) {
      expect(errorPassed).toEqual(error);
    }
  });
  it("should create an Observable from an async generator", async () => {
    let index = 1;
    for await (const iterator of from(
      (async function* () {
        for (let index = 1; index < 5; index++) {
          yield new Promise<void>((resolve) =>
            setTimeout(() => resolve(), 100)
          );
          yield index;
        }
      })()
    ).subscribe()) {
      expect(iterator).toEqual(index);
      index += 1;
    }
  });
  it("should create an Observable from an async generator and catch any exception", async () => {
    const error = new Error("test");
    try {
      for await (const iterator of from(
        (async function* () {
          throw error;
        })()
      ).subscribe()) {
      }
    } catch (errorPassed) {
      expect(errorPassed).toEqual(error);
    }
  });
  it("should create an Observable from a promise", async () => {
    let index = 1;
    for await (const iterator of from(
      new Promise<number>((resolve) => resolve(index))
    ).subscribe()) {
      expect(iterator).toEqual(index);
      index += 1;
    }
  });
  it("should create an Observable from a promise and catch any rejection", async () => {
    const error = new Error("test");
    try {
      for await (const iterator of from(
        new Promise<number>((resolve, reject) => reject(error))
      ).subscribe()) {
      }
    } catch (errorPassed) {
      expect(errorPassed).toEqual(error);
    }
  });
  it("should create an Observable from an Observable", async () => {
    let index = 1;
    const obs = new Observable(async function* () {
      for (let index = 1; index < 5; index++) {
        yield new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
        yield index;
      }
    });
    for await (const iterator of from(obs).subscribe()) {
      expect(iterator).toEqual(index);
      index += 1;
    }
  });
  it("should create an Observable from an Observable and catch any exception", async () => {
    const error = new Error("test");
    const obs = new Observable(async function* (throwError) {
      throwError(error);
    });
    try {
      for await (const iterator of from(obs).subscribe()) {
      }
    } catch (errorPassed) {
      expect(errorPassed).toEqual(error);
    }
  });
  it("should throw an error if called with anything else", () => {
      expect(() => from(22 as any)).toThrow()
  })
});

const test = function* () {};
