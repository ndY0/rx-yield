import { Observable } from ".";
import { FifoBuffer } from "../buffers/fifo.buffer";
import { pipeFromArray } from "../utils";

describe("Observable", () => {
  it("should create an Observable instance, given the item factory", () => {
    const factory = async function* (throwError: (err: any) => void) {};
    const obs = new Observable(factory);
    expect(obs).toBeInstanceOf(Observable);
    expect(Reflect.get(obs, "factory")).toEqual(factory);
    expect(typeof Reflect.get(obs, "throwError")).toEqual("function");
    expect(Reflect.get(obs, "innerError")).toEqual(undefined);
    expect(Reflect.get(obs, "bufferFactory")()).toBeInstanceOf(FifoBuffer);
    expect(Reflect.get(Reflect.get(obs, "bufferFactory")(), "length")).toEqual(
      Infinity
    );
  });
  it("should start running consumption side on consumption of subscription", async () => {
    const spyRunning = jest.fn();
    const factory = async function* (throwError: (err: any) => void) {
      for (let index = 0; index < 10; index++) {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
        spyRunning(index);
        yield index;
      }
    };
    const spyFactory = jest.fn((throwError: (err: any) => void) =>
      factory(throwError)
    );
    const obs = new Observable(spyFactory);
    obs.subscribe().next();
    expect(spyFactory).toHaveBeenCalledTimes(1);
    expect(spyFactory).toHaveBeenCalledWith(Reflect.get(obs, "throwError"));
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 1100));
    for (let index = 0; index < 10; index++) {
      expect(spyRunning).toHaveBeenNthCalledWith(index + 1, index);
    }
  });
  it("should allow consuming produced data and awaiting data to be produced", async () => {
    const spyRunning = jest.fn();
    const factory = async function* (throwError: (err: any) => void) {
      for (let index = 0; index < 10; index++) {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
        spyRunning(index);
        yield index;
      }
    };
    const spyFactory = jest.fn((throwError: (err: any) => void) =>
      factory(throwError)
    );
    const obs = new Observable(spyFactory);
    let index = 0;
    let currentTimeStamp = new Date().getTime();
    for await (const elem of obs.subscribe()) {
      const nextTimestamp = new Date().getTime();
      expect(elem).toEqual(index);
      expect(nextTimestamp - currentTimeStamp).toBeGreaterThanOrEqual(50);
      currentTimeStamp = nextTimestamp;
      index += 1;
    }
  });
  it("should allow writting until buffer is full, awaiting for consumption", async () => {
    const spyRunning = jest.fn();
    const factory = async function* (throwError: (err: any) => void) {
      for (let index = 0; index < 10; index++) {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
        spyRunning(index);
        yield index;
      }
    };
    const spyFactory = jest.fn((throwError: (err: any) => void) =>
      factory(throwError)
    );
    const obs = new Observable(spyFactory);
    Reflect.set(obs, "bufferFactory", () => new FifoBuffer<any>(1));
    let index = 0;
    let currentTimeStamp = new Date().getTime();
    for await (const elem of obs.subscribe()) {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 300));
      const nextTimestamp = new Date().getTime();
      expect(elem).toEqual(index);
      expect(spyRunning).toHaveBeenCalledTimes(index < 8 ? index + 3 : 10);
      expect(nextTimestamp - currentTimeStamp).toBeGreaterThanOrEqual(250);
      currentTimeStamp = nextTimestamp;
      index += 1;
    }
  });
  it("should allow writing data in await mode until throwError call, consuming data until buffer empties then throw error in comsumer part", async () => {
    const spyRunning = jest.fn();
    const error = new Error("test");
    const factory = async function* (throwError: (err: any) => void) {
      for (let index = 0; index < 10; index++) {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
        if (index === 7) {
          throwError(error);
        }
        spyRunning(index);
        yield index;
      }
    };
    const spyFactory = jest.fn((throwError: (err: any) => void) =>
      factory(throwError)
    );
    const obs = new Observable(spyFactory);
    Reflect.set(obs, "bufferFactory", () => new FifoBuffer<any>(1));
    let index = 0;
    let currentTimeStamp = new Date().getTime();
    try {
      for await (const elem of obs.subscribe()) {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 300));
        const nextTimestamp = new Date().getTime();
        expect(elem).toEqual(index);
        expect(spyRunning).toHaveBeenCalledTimes(index < 6 ? index + 3 : 8);
        expect(nextTimestamp - currentTimeStamp).toBeGreaterThanOrEqual(250);
        currentTimeStamp = nextTimestamp;
        index += 1;
      }
    } catch (errorReceived) {
      expect(errorReceived).toEqual(error);
      expect(index).toEqual(7);
    }
  });
  it("should stop writing data if throwError is called immediately, consuming data until buffer empties then throw error in comsumer part", async () => {
    const spyRunning = jest.fn();
    const error = new Error("test");
    const factory = async function* (throwError: (err: any) => void) {
      if (index === 7) {
        throwError(error);
      }
    };
    const spyFactory = jest.fn((throwError: (err: any) => void) =>
      factory(throwError)
    );
    const obs = new Observable(spyFactory);
    Reflect.set(obs, "bufferFactory", () => new FifoBuffer<any>(1));
    let index = 0;
    try {
      for await (const elem of obs.subscribe()) {
        expect(elem).toEqual(index);
        index += 1;
      }
    } catch (errorReceived) {
      expect(errorReceived).toEqual(error);
      expect(index).toEqual(0);
    }
  });
  it("should allow piping operator, composing them before returning the composed observable", async () => {
    const op1 =
      <T, U>(value: number) =>
      (input: Observable<T>) =>
        new Observable(async function* () {
          for await (const iterator of input.subscribe()) {
            yield value;
          }
        });
    const op2 =
      <T extends number, U>(pow: number) =>
      (input: Observable<T>) =>
        new Observable(async function* () {
          for await (const iterator of input.subscribe()) {
            yield iterator * pow;
          }
        });
    const obs1 = new Observable(async function* () {
      for (let index = 0; index < 10; index++) {
        yield index;
      }
    });
    const composed = obs1.pipe(op1(10), op2(2));
    expect(composed).toBeInstanceOf(Observable);
    for await (const iterator of composed.subscribe()) {
      expect(iterator).toEqual(20);
    }
  });
});
