import { Observable } from "./observable";
import { catchError } from "./operators/catchError";
import { delay } from "./operators/delay";
import { last } from "./operators/last";
import { map } from "./operators/map";
import { share } from "./operators/share";
import { tap } from "./operators/tap";
import { throttle } from "./operators/throttle";
import { throwError } from "./operators/throwError";
import { EventEmitter } from "events";
import { IBuffer } from "./interfaces/buffer.interface";
import { mergeMap } from "./operators/mergeMap";
import { first } from "./operators/first";

const obs = new Observable(async function* () {
  for (let index = 0; index < 100; index++) {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 10));
    // if (index === 10) {
    //   throw new Error("je suis une erreur ! ");
    // }
    yield index;
  }
}).pipe(
  map((elem: number) => `${elem}`)
  // mergeMap(
  //   (elem: string) =>
  //     new Observable(async function* () {
  //       for (let index = 0; index < 3; index++) {
  //         await new Promise<void>((resolve) => setTimeout(() => resolve(), 10));
  //         yield `${elem}_${index}`;
  //       }
  //     })
  // ),
  // first()

  // share()
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

const testbis = async (id: number) => {
  try {
    for await (const elem of obs.subscribe()) {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 200));
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
// testbis(2);
