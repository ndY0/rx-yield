import { interval } from "./interval";

describe("interval", () => {
  it("should create an observable that emit incremental integer at specified interval, until limit", async () => {
    const obs = interval(200, 10);
    let current = new Date().getTime();
    let index = 0;
    for await (const iterator of obs.subscribe()) {
      const newTime = new Date().getTime();
      expect(iterator).toEqual(index);
      expect(newTime - current).toBeGreaterThanOrEqual(150);
      current = newTime;
      index += 1;
    }
  });
});
