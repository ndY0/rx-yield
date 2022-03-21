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
import { bufferTime } from "./operators/bufferTime";
import { every } from "./operators/every";
import { exhaustMap } from "./operators/exhaustMap";
import { finalize } from "./operators/finalize";
import { ignoreElements } from "./operators/ignoreElements";
import { max } from "./operators/max";
import { mergeWith } from "./operators/mergeWith";
import { retry } from "./operators/retry";
import { sampleTime } from "./operators/sampleTime";
import { skip } from "./operators/skip";

const subject = new Subject<string>();
const obs = new Observable(async function* () {
  // await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
  for (let index = 0; index < 100; index++) {
    // console.log(index);
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 200));
    // if (index === 10) {
    //   // yield ''
    // throw new Error("je suis une erreur ! ");
    // }
    yield index;
  }
}).pipe(
  skip(10),
  // mergeWith(obs, obs, obs, obs, obs)
  // share(false)
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
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 10));
    if (index === 30) {
      subject.next("");
    }
    await subject.next("test");
  }
};

test(1);
// testbis(2);
// runSubject();
