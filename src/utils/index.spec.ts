import { pipeFromArray, promisify } from ".";
import { Observable } from "../observable";

describe("pipeFromArray", () => {
  it("should recursively compose operator functions", () => {
    const spyTracer = jest.fn();
    const op1 = (obs: Observable<number>) => {
      spyTracer(1);
      return obs;
    };
    const op2 = (obs: Observable<number>) => {
      spyTracer(2);
      return obs;
    };
    const op3 = (obs: Observable<number>) => {
      spyTracer(3);
      return obs;
    };
    const obs = new Observable(async function* () {
      yield 1;
    });
    const piped = pipeFromArray([op1, op2, op3]);
    expect(typeof piped).toEqual("function");
    const composed = piped(obs);
    expect(spyTracer).toHaveBeenNthCalledWith(1, 1);
    expect(spyTracer).toHaveBeenNthCalledWith(2, 2);
    expect(spyTracer).toHaveBeenNthCalledWith(3, 3);
  });
});
describe("promisify", () => {
  it("should allow to transform a tail callback function type into a Promise, resolving when callback is called", async () => {
    expect(
      await promisify((test: number, callback: (res: number) => void) => {
        callback(test);
      })(10)
    ).toEqual(10);
  });
});
