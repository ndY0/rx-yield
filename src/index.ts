import { Observable } from "./observable";
import { catchError } from "./operators/catchError";
import { delay } from "./operators/delay";
import { last } from "./operators/last";
import { map } from "./operators/map";
import { share } from "./operators/share";
import { tap } from "./operators/tap";
import { throttle } from "./operators/throttle";
import { throwError } from "./operators/throwError";

const obs = new Observable(async function* () {
  for (let index = 0; index < 20; index++) {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 10));
    // if (index === 10) {
    //   throw new Error("je suis une erreur ! ");
    // }
    yield index;
  }
}).pipe(
  map((elem: number) => `${elem}`),
  share()
  // catchError(
  //   (e: Error) => throwError(() => e)
  // new Observable(async function* () {
  //   for (let index = 0; index < 3; index++) {
  //     await new Promise<void>((resolve) => setTimeout(() => resolve(), 10));
  //     yield `${e.name}_${index}`;
  //   }
  // })
  // )
  // last()
  // delay(1000),
  // tap((test: string) => console.log(test)),
  // throttle(2000)
);

const test = async (id: number) => {
  try {
    for await (const elem of obs.subscribe()) {
      console.log("starting consumer : ", id);
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
      if (elem === undefined) {
        break;
      }
      console.log(`in consumer ${id} : `, elem);
    }
  } catch (e) {
    console.log(`received an error in consumer ${id} : `, e);
  }
};

test(1);
// test(2);
