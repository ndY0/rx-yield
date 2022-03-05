import { IBuffer } from "../interfaces/buffer.interface";
import { Buffer } from "./buffer";

export class FifoBuffer<T> extends Buffer implements IBuffer<T> {
  private data: T[] = [];

  read(): T | undefined {
    return this.data.shift();
  }
  write(element: T): boolean {
    if (this.size() < this.length) {
      this.data.unshift(element);
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
