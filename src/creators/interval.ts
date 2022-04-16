import { EventEmitter } from "events";
import { Observable } from "../observable";
import { promisify } from "../utils";



const interval = (
  period: number
): Observable<number> =>
  new Observable<number>(async function* () {
    let step = 0
    const buildInterval = () => new Promise<void>((resolve) => setTimeout(() => resolve(), period))
    while(true) {
      await buildInterval();
      yield step;
      step += 1;
    } 
  });

export { interval };
