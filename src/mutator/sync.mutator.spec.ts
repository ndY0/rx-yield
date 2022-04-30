import { Observable } from "../observable";
import { Sync } from "./sync.mutator";

describe("Sync", () => {
    it("should switch buffer factory of the output observable of an operator function with one instanciating a buffer with given length", () => {
        const obs = new Observable<void>(async function*() {
        })
        const operator = (test: string) => (observable: Observable<any>) => observable;
        const synced = Sync(operator, 10)
        expect(Reflect.get(Reflect.get(synced("test")(obs), "bufferFactory")(), "length")).toEqual(10);
    })
    it("should switch buffer factory of the output observable of an operator function with one instanciating a buffer with default length", () => {
        const obs = new Observable<void>(async function*() {
        })
        const operator = (test: string) => (observable: Observable<any>) => observable;
        const synced = Sync(operator)
        expect(Reflect.get(Reflect.get(synced("test")(obs), "bufferFactory")(), "length")).toEqual(1);
    })

    it("should switch buffer factory of the output observable of an operator function with one instanciating a buffer with given length, and setting optional backpressureCallback", () => {
        const obs = new Observable<void>(async function*() {
        })
        const backPressureCallback = () => {};
        const operator = (test: string) => (observable: Observable<any>) => observable;
        const synced = Sync(operator, 10 ,backPressureCallback)
        expect(Reflect.get(Reflect.get(synced("test")(obs), "bufferFactory")(), "length")).toEqual(10);
        expect(Reflect.get(synced("test")(obs), "backpressureCallback")).toEqual(backPressureCallback);
    })
})