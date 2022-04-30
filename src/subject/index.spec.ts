import { Subject } from ".";
import { PipedObservable } from "../observable/piped";

describe("Subject", () => {
  it("should extends PipedObservable, with share operator as constructor argument", () => {
    const subject = new Subject<any>();
    expect(subject).toBeInstanceOf(PipedObservable);
  });
  it("should push every element passed to next into subscribers, and end subscription on complete call", async () => {
    const subject = new Subject<number>();
    const spyRunning1 = jest.fn();
    const spyRunning2 = jest.fn();
    const test1 = async () => {
      let index = 0;
      let currentTime = new Date().getTime();
      for await (const iterator of subject.subscribe()) {
        spyRunning1();
        expect(iterator).toEqual(index);
        const newTime = new Date().getTime();
        expect(newTime - currentTime).toBeGreaterThanOrEqual(50);
        currentTime = newTime;
        index += 1;
      }
    };
    const test2 = async () => {
      let index = 0;
      let currentTime = new Date().getTime();
      for await (const iterator of subject.subscribe()) {
        spyRunning2();
        expect(iterator).toEqual(index);
        const newTime = new Date().getTime();
        expect(newTime - currentTime).toBeGreaterThanOrEqual(50);
        currentTime = newTime;
        index += 1;
      }
    };
    test1();
    test2();

    for (let index = 0; index < 10; index++) {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
      await subject.next(index);
    }
    subject.complete();
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 2000));
    expect(spyRunning1).toHaveBeenCalledTimes(10);
    expect(spyRunning2).toHaveBeenCalledTimes(10);
  });
  it("should push every element passed to next into subscribers, thrown error on subscribers if error is called, then complete", async () => {
    const subject = new Subject<number>();
    const error = new Error("test");
    const spyRunning1 = jest.fn();
    const spyRunning2 = jest.fn();
    const test1 = async () => {
      let index = 0;
      let currentTime = new Date().getTime();
      try {
        for await (const iterator of subject.subscribe()) {
          spyRunning1();
          expect(iterator).toEqual(index);
          const newTime = new Date().getTime();
          expect(newTime - currentTime).toBeGreaterThanOrEqual(50);
          currentTime = newTime;
          index += 1;
        }
      } catch (e) {
        spyRunning1(error);
        expect(e).toEqual(error);
      }
    };
    const test2 = async () => {
      let index = 0;
      let currentTime = new Date().getTime();
      try {
        for await (const iterator of subject.subscribe()) {
          spyRunning2();
          expect(iterator).toEqual(index);
          const newTime = new Date().getTime();
          expect(newTime - currentTime).toBeGreaterThanOrEqual(50);
          currentTime = newTime;
          index += 1;
        }
      } catch (e) {
        spyRunning2(error);
        expect(e).toEqual(error);
      }
    };
    test1();
    test2();
    for (let index = 0; index < 10; index++) {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
      if (index === 7) {
        subject.error(error);
        // break;
      }
      await subject.next(index);
    }
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 2000));
    expect(spyRunning1).toHaveBeenCalledTimes(8);
    expect(spyRunning2).toHaveBeenCalledTimes(8);
    expect(spyRunning1).toHaveBeenLastCalledWith(error);
    expect(spyRunning2).toHaveBeenLastCalledWith(error);
  });
  it("should push every element passed to next into subscribers, buffering if consumption is too slow", async () => {
    const subject = new Subject<number>(1000, 1);
    const spyRunning1 = jest.fn();
    const spyRunning2 = jest.fn();
    const test1 = async () => {
      let index = 0;
      let currentTime = new Date().getTime();
      for await (const iterator of subject.subscribe()) {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 200));
        spyRunning1();
        expect(iterator).toEqual(index);
        const newTime = new Date().getTime();
        expect(newTime - currentTime).toBeGreaterThanOrEqual(50);
        currentTime = newTime;
        index += 1;
      }
      return 
    };
    const test2 = async () => {
      let index = 0;
      let currentTime = new Date().getTime();
      for await (const iterator of subject.subscribe()) {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 200));
        spyRunning2();
        expect(iterator).toEqual(index);
        const newTime = new Date().getTime();
        expect(newTime - currentTime).toBeGreaterThanOrEqual(50);
        currentTime = newTime;
        index += 1;
      }
      return
    };
    test1();
    test2();

    for (let index = 0; index < 10; index++) {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
      await subject.next(index);
    }
    subject.complete();
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));
    expect(spyRunning1).toHaveBeenCalledTimes(10);
    expect(spyRunning2).toHaveBeenCalledTimes(10);
  });
  it("should push every element passed to next into subscribers, awaiting in next if writing buffer is full", async () => {
    const subject = new Subject<number>(1, 1);
    const spyRunning1 = jest.fn();
    const spyRunning2 = jest.fn();
    const test1 = async () => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));
      for await (const iterator of subject.subscribe()) {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
        spyRunning1();
      }
    };
    const test2 = async () => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));
      for await (const iterator of subject.subscribe()) {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
        spyRunning2();
      }
    };
    test1();
    test2();

    let currentTime = new Date().getTime();
    for (let index = 0; index < 10; index++) {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 10));
      await subject.next(index);
      const newTime = new Date().getTime();
      if(index === 1) {
        expect(newTime - currentTime).toBeGreaterThanOrEqual(2000);
      }
        currentTime = newTime;
    }
    subject.complete();
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 10000));
    expect(spyRunning1).toHaveBeenCalledTimes(10);
    expect(spyRunning2).toHaveBeenCalledTimes(8);
  });
});
