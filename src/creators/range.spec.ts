import { range } from "./range";

describe("range", () => {
  it("should create an observable of number starting at first argument, and emitting the second argument of emissions, included", async () => {
    const start = 3;
    const count = 10;
    let index = start;
    for await (const iterator of range(start, count).subscribe()) {
      expect(iterator).toEqual(index);
      index += 1;
    }
    expect(index).toEqual(count + start)
  });
});
