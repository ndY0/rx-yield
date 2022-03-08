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
import { bufferCount } from "./operators/bufferCount";
import { audit } from "./operators/audit";
import { bufferWhen } from "./operators/bufferWhen";
import { concatMapTo } from "./operators/concatMapTo";
import { count } from "./operators/count";
import { defaultIfEmpty } from "./operators/defaultIfEmpty";
import { Subject } from "./subject";

const subject = new Subject<number>();
// const obs = new Observable(async function* () {
//   await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
//   for (let index = 0; index < 200; index++) {
//     await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
//     // if (index === 10) {
//     //   throw new Error("je suis une erreur ! ");
//     // }
//     yield index;
//   }
// })
const obs = subject.pipe(
  map((elem: number) => `${elem}`),
  share(false)
  // bufferWhen(
  //   () =>
  //     new Observable<number>(async function* () {
  //       await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
  //       yield 0;
  //     })
  // )
);

const test = async (id: number) => {
  try {
    // await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
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

const runSubject = async () => {
  for (let index = 0; index < 100; index++) {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
    await subject.next(index);
  }
};

test(1);
testbis(2);
runSubject();
