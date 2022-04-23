import { FifoBuffer } from "./fifo.buffer";
import { Buffer } from "./buffer";

describe("FifoBuffer", () => {
  it("should instanciate an instance of Buffer, with the given size", () => {
    const buffer = new FifoBuffer(100);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(Reflect.get(buffer, "length")).toEqual(100);
    expect(Reflect.get(buffer, "data")).toEqual([]);
  });
  it("should instanciate an instance of Buffer, with default infinite size", () => {
    const buffer = new FifoBuffer();
    expect(buffer).toBeInstanceOf(Buffer);
    expect(Reflect.get(buffer, "length")).toEqual(Infinity);
    expect(Reflect.get(buffer, "data")).toEqual([]);
  });

  it("should write into buffer, return true if max size not reached, false otherwise", () => {
    const buffer = new FifoBuffer(3);
    expect(buffer.write("test")).toBeTruthy();
    expect(buffer.write("test")).toBeTruthy();
    expect(buffer.write("test")).toBeTruthy();
    expect(buffer.write("test")).toBeFalsy();
  });
  it("should read from buffer, return data, and undefined if buffer is empty", () => {
    const buffer = new FifoBuffer(3);
    buffer.write("test");
    expect(buffer.read()).toEqual("test");
    expect(buffer.read()).toEqual(undefined);
  });

  it("should return current buffer size", () => {
    const buffer = new FifoBuffer(3);
    buffer.write("test");
    buffer.write("test");
    expect(buffer.size()).toEqual(2);
  });

  it("should reset buffer internal array to empty array", () => {
    const buffer = new FifoBuffer(3);
    buffer.write("test");
    buffer.write("test");
    buffer.flush();
    expect(Reflect.get(buffer, "data")).toEqual([]);
  });
});
