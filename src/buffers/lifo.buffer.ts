import { IBuffer } from "../interfaces/buffer.interface";
import { Buffer } from "./buffer";

export class LifoBuffer<T> extends Buffer implements IBuffer<T> {
  private data: T[] = [];
  static alloc(size: number) {
    return new this(size);
  }
  read(): T | undefined {
    return this.data.pop();
  }
  write(element: T): boolean {
    if (this.size() < this.length) {
      this.data.push(element);
      return true;
    } else {
      return false;
    }
  }
  size(): number {
    return this.data.length;
  }
  flush(): void {
    this.data = [];
  }
}
