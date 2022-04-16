import { Observable } from "../observable";

const onEvery = <T>(
  source: Observable<T>,
  {
    next,
    error,
    complete,
  }: {
    next?: (value: T) => void | Promise<void>;
    error?: (reason: any) => void | Promise<void>;
    complete?: () => void | Promise<void>;
  }
) => {
  const run = async () => {
    try {
      for await (const elem of source.subscribe()) {
        if (next) {
          next(elem);
        }
      }
      if (complete) {
        complete();
      }
    } catch (e) {
      if (error) {
        error(e);
      }
    }
  };
  run();
};

export { onEvery };
