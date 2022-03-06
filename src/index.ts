import { Observable } from "./observable";

const obs = new Observable(async function* () {
  for (let index = 0; index < 100; index++) {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 10));
    console.log("in producer : ", index);
    yield index;
  }
});

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
