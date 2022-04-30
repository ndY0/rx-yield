import { Observable } from "../observable";
import { puppet } from "./puppet.mutator";

describe("puppet", () => {
  it("should switch buffer factory of an observable with one instanciating a buffer with given length", () => {
    const obs = new Observable<void>(async function* () {});
    expect(
      Reflect.get(Reflect.get(puppet(obs, 10), "bufferFactory")(), "length")
    ).toEqual(10);
  });
  it("should switch buffer factory of an observable with one instanciating a buffer with default length of 1", () => {
    const obs = new Observable<void>(async function* () {});
    expect(
      Reflect.get(Reflect.get(puppet(obs), "bufferFactory")(), "length")
    ).toEqual(1);
  });
  it("should switch buffer factory of an observable with one instanciating a buffer with given length, and set backpresureCallback if provided", () => {
    const obs = new Observable<void>(async function* () {});
    const backPressureCallback = () => {};
    expect(
      Reflect.get(Reflect.get(puppet(obs, 10), "bufferFactory")(), "length")
    ).toEqual(10);
    expect(Reflect.get(puppet(obs, 10, backPressureCallback), "backpressureCallback")).toEqual(backPressureCallback)
  });
});
