export interface IBuffer<T = any> {
  read(): T | undefined;
  write(element: T): boolean;
  size(): number;
  flush(): void;
}
