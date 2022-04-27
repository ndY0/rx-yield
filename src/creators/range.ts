import { Observable } from "../observable";

const range = (from: number, count: number) =>
  new Observable<number>(async function* () {
    let running = true;
    let step = from;
    let counter = 0;
    while (running) {
      yield step;
      step += 1;
      counter += 1;
      if ((counter === count)) {
        running = false;
      }
    }
  });

export { range };
