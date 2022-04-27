import { Observable } from "../observable";
import { onEvery } from "./onEvery";

describe("onEvery", () => {
    it("should accept an observable as argument, a consumer interface as second argument, call next with every value emitted, complete when observable complete", (done) => {
        const nextSpy = jest.fn((value) => {
            expect(typeof value).toEqual('number');
        })
        const completeSpy = jest.fn(() => {
            expect(nextSpy).toHaveBeenCalledTimes(10);
            done()
        })
        onEvery(
            new Observable(async function* () {
              for (let index = 0; index < 10; index++) {
                await new Promise<void>((resolve) =>
                  setTimeout(() => resolve(), 100)
                );
                yield index;
              }
            }), {
                next: nextSpy,
                complete: completeSpy
            }
          );
    })
    it("should accept an observable as argument, a consumer interface as second argument, call error when observable error", (done) => {
        const error = new Error("test");
        const errorSpy = jest.fn((errorPassed) => {
            expect(errorPassed).toEqual(error);
            done();
        })
        onEvery(
            new Observable(async function* (throwError) {
              for (let index = 0; index < 10; index++) {
                await new Promise<void>((resolve) =>
                  setTimeout(() => resolve(), 100)
                );
                if(index === 7) {
                    throwError(error)
                }
                yield index;
              }
            }), {
                error: errorSpy,
            }
          );
    })
})