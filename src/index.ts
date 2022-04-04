import { Observable } from "./observable";
import { catchError } from "./operators/catchError";
import { delay } from "./operators/delay";
import { last } from "./operators/last";
import { map } from "./operators/map";
import { share } from "./operators/share";
import { tap } from "./operators/tap";
import { throttle } from "./operators/throttle";
// import { throwError } from "./operators/throwError";
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
import { skipWhile } from "./operators/skipWhile";
import { switchAll } from "./operators/switchAll";
import { switchScan } from "./operators/switchScan";
import { takeUntil } from "./operators/takeUntil";
import { timeInterval } from "./operators/timeInterval";
import { timestamp } from "./operators/timestamp";
import { windowCount } from "./operators/windowCount";
import { windowWhen } from "./operators/windowWhen";
import { zipAll } from "./operators/zipAll";
import { auditTime } from "./operators/auditTime";
import { combineLatestAll } from "./operators/combineLatestAll";
import { concatAll } from "./operators/concatAll";
import { concatWith } from "./operators/concatWith";
import { debounce } from "./operators/debounce";
import { distinct } from "./operators/distinct";
import { elementAt } from "./operators/elementAt";
import { expand } from "./operators/expand";
import { find } from "./operators/find";
import { isEmpty } from "./operators/isEmpty";

const subject = new Subject<string>();
const obs = new Observable<number>(async function* (
  throwError: (error: any) => void
) {
  // await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
  for (let index = 0; index < 10; index++) {
    // let shouldThrow = false;
    // console.log(index);
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
    // if(index === 3) {
      // throwError(new Error("hu source ?"))
    // }

    
      // yield Math.ceil(index/10) * 10;
    yield index;
  }
  // if (index === 64) {
  // // yield ''
  // // shouldThrow = true;
  // // throw new Error("je suis une erreur ! ")
  // // throwError(new Error("je suis une erreur ! "));
  // // return
  // }
  // console.log("sending", index)
  // yield index;
  // yield new Observable(async function* () {
  //   for (let index = 0; index < 30; index++) {
  //     await new Promise<void>((resolve) => setTimeout(() => resolve(), 200));
  //     if (index === 15 && shouldThrow) {
  //       // yield ''
  //       throw new Error("je suis une erreur ! ");
  //     }
  //     yield index;
  //   }
  // });
}).pipe(
  isEmpty()
  // windowCount(10, 0),
  // switchAll(),
  // zipAll()
  // mergeWith(obs, obs, obs, obs, obs)
  // share(false)
  // bufferWhen(
  //   () =>
      // new Observable<number>(async function* () {
      //   await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
      //   yield 0;
      // })
  // )
);

const test = async (id: number) => {
  try {
    // await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
    console.log("start !");
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
  console.log("exited normaly");
};

const testbis = async (id: number) => {
  try {
    for await (const elem of subject.subscribe()) {
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
