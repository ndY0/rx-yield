import { generate } from "./generate";

describe("generate", () => {
    it("should generate value according to the given initial value, step function and stop condition function, passing them to through the selector function before emition", async () => {
        const step = jest.fn((previous: number) => previous + 1);
        const whileDo = jest.fn((current: number) => current < 10);
        const selectDo = jest.fn((current: number) => `${current}`);
        let index = 0;
        for await (const iterator of generate(0, whileDo, step, selectDo).subscribe()) {
            expect(iterator).toEqual(`${index}`)
            index += 1;
        }
    })
})