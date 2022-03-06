import { Observable } from "./observable";
import { delay } from "./operators/delay";
import { last } from "./operators/last";
import { map } from "./operators/map";
import { tap } from "./operators/tap";
import { throttle } from "./operators/throttle";

const obs = new Observable(async function* () {
  for (let index = 0; index < 1100; index++) {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 10));
    yield index;
  }
}).pipe(
  map((elem: number) => `${elem}`)
  // last()
  // delay(1000),
  // tap((test: string) => console.log(test)),
  // throttle(2000)
);

const test = async () => {
  for await (const elem of obs.subscribe()) {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 200));
    if (elem === undefined) {
      break;
    }
    console.log("in consumer : ", elem);
  }
};

test();
