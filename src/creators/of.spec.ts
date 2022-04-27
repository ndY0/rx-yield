import { of } from "./of";

describe("of", () => {
  it("should create an observable that emits the arguments in sequence", async () => {
    let index = 0;
    const val1 = 1;
    const val2 = { test: "test" };
    const val3 = Symbol.for("test");
    const vals = [val1, val2, val3];
    for await (const iterator of of(val1, val2, val3).subscribe()) {
      expect(iterator).toEqual(vals[index]);
      index += 1;
    }
  });
});
