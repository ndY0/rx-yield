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
import { concatMap } from "./operators/concatMap";
import { first } from "./operators/first";
import { bufferCount } from "./operators/bufferCount";
import { audit } from "./operators/audit";
import { bufferWhen } from "./operators/bufferWhen";
import { concatMapTo } from "./operators/concatMapTo";
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
import { onErrorResumeNext } from "./operators/onErrorResumeNext";
import { raceWith } from "./operators/raceWith";
import { repeat } from "./operators/repeat";
import { retryWhen } from "./operators/retryWhen";
import { mapTo } from "./operators/mapTo";
import { throwError } from "./operators/throwError";
import { scan } from "./operators/scan";
import { skipLast } from "./operators/skipLast";
import { startWith } from "./operators/startWith";
import { switchMap } from "./operators/switchMap";
import { mergeMap } from "./operators/mergeMap";
import { throttleTime } from "./operators/throttleTime";
import { timeout } from "./operators/timeout";
import { toArray } from "./operators/toArray";
import { windowTime } from "./operators/windowTime";
import { withLatestFrom } from "./operators/withLatestFrom";
import { zipWith } from "./operators/zipWith";
import { buffer } from "./operators/buffer";
import { bufferToggle } from "./operators/bufferToggle";
import { combineLatestWith } from "./operators/combineLatestWith";
import { debounceTime } from "./operators/debounceTime";
import { delayWhen } from "./operators/delayWhen";
import { distinctUntilChanged } from "./operators/distinctUntilChanged";
import { exhaustAll } from "./operators/exhaustAll";
import { mergeMapTo } from "./operators/mergeMapTo";
import { filter } from "./operators/filter";
import { materialize } from "./operators/materialize";
import { dematerialize } from "./operators/dematerialize";
import { mergeAll } from "./operators/mergeAll";
import { mergeScan } from "./operators/mergeScan";
import { pairwise } from "./operators/pairwise";
import { reduce } from "./operators/reduce";
import { repeatWhen } from "./operators/repeatWhen";
import { sample } from "./operators/sample";
import { sequenceEqual } from "./operators/sequenceEqual";
import { single } from "./operators/single";
import { skipUntil } from "./operators/skipUntil";
import { switchMapTo } from "./operators/switchMapTo";
import { takeLast } from "./operators/takeLast";
import { throwIfEmpty } from "./operators/throwIfEmpty";
import { window } from "./operators/window";
import { windowToggle } from "./operators/windowToggle";
import { from } from "./creators/from";
import { lastValueFrom } from "./casters/lastValueFrom";
import { onEvery } from "./casters/onEvery";
import { range } from "./creators/range";
import { of } from "./creators/of";
import { interval } from "./creators/interval";
import { generate } from "./creators/generate";
import { fromEventEmitter } from "./creators/fromEventEmitter";
import { Sync } from "./mutator/sync.mutator";

let count = 0;
const subject = new Subject<string>();
const obs = new Observable<number>(async function* (
  throwError: (error: any) => void
) {
  // await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
  for (let index = 1; index < 200; index++) {
    // let shouldThrow = false;
    // console.log(index);
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
    // if(index === 20) {
    // throwError(new Error("hu source ?"))
    // }

    // yield Math.ceil(index/10) * 10;
    // yield new Observable(async function* (throwError: (error: any) => void) {

    //   for (let index2 = 0; index2 < 10; index2++) {
    //     await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
    //     yield index
    //   }
    // })
    console.log(index)
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
  windowToggle(
    new Observable(async function* (throwError: (error: any) => void) {
      for (let index = 0; index < 200; index++) {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 300));
        // if(index === 7) {
        //   throwError(new Error("hu source ?"))
        //   }
        yield index;
      }
    }),
    (elem: number) =>
      from([elem]).pipe(
        delay(400),
      )
  ),
  Sync(mergeAll, 5, (value) => console.log("mergeAll", value))()
  // raceWith(
  //   new Observable<number>(async function* (throwError: (error: any) => void) {
  //     for (let index = 0; index < 10; index++) {
  //       await new Promise<void>((resolve) => setTimeout(() => resolve(), 400));
  //       console.log("second one !")
  //       throwError(new Error("hu source ?"))
  //       if(index === 3) {
  //         }
  //       yield index;
  //     }
  //   }),
  //   new Observable<string>(async function* (throwError: (error: any) => void) {
  //     for (let index = 0; index < 10; index++) {
  //       console.log("third one !")
  //       if(index === 3) {
  //         throwError(new Error("hu source ?"))
  //         }
  //       await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
  //       yield `${index}`;
  //     }
  //   }),
  //   new Observable<number>(async function* (throwError: (error: any) => void) {
  //     for (let index = 0; index < 10; index++) {
  //       await new Promise<void>((resolve) => setTimeout(() => resolve(), 400));
  //       console.log("fourth one !")
  //       // if(index === 3) {
  //       //   throwError(new Error("hu source ?"))
  //       //   }
  //       yield index;
  //     }
  //   })
  // )
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
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      if (elem === undefined) {
        break;
      }
      count += 1;
      console.log(count);
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

const testCreators = async () => {
  const emitter = new EventEmitter();
  onEvery(
    fromEventEmitter<{foo: string}>(emitter, "foo")
      // delay(2000),
      // mergeMap(() => throwError(() => new Error("test")))
    ,
    {
      next: (elem) => console.log(elem),
      error: (e) => console.log(e),
      complete: () => console.log("completed ! ")
    }
  );
  setInterval(() => {emitter.emit("foo", {foo: "bar"})}, 200)
};

test(1);
// testbis(2);
// runSubject();
// testCreators();
