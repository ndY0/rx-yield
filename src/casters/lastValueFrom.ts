import { Observable } from "../observable";
import { last } from "../operators/last";

const lastValueFrom = <T>(source: Observable<T>): Promise<T | void> => {
  return new Promise((resolve, reject) => {
    let emitted = false;
    source
      .pipe(last())
      .subscribe()
      .next()
      .then((res) => {
        if (res.done && !emitted) {
          resolve();
        }
        if (res.value !== undefined) {
          resolve(res.value);
          emitted = true;
        }
      })
      .catch((e) => reject(e));
  });
};

export { lastValueFrom };
