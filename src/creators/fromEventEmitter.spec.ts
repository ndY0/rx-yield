import {EventEmitter} from "events"
import { fromEventEmitter } from "./fromEventEmitter";

describe("fromEventEmitter", () => {
    it("should create an observable that emit when the passed event emitter receive an event of the specified name", async () => {
        const eventEmitter = new EventEmitter();
        const obs = fromEventEmitter(eventEmitter, "foo");
        let stop = false;
        const run = async () => {
            await new Promise<void>((resolve) => setTimeout(() => resolve(), 300));
            for (let index = 0; index < 10; index++) {
                eventEmitter.emit("foo", "bar");
            }
            stop = true;
        }
        run();
        for await (const iterator of obs.subscribe()) {
            expect(iterator).toEqual("bar");
            if(stop) {
                break;
            }
        }
    })
})