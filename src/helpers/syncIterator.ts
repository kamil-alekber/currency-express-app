// iterator, iterable
import { ZipCodeValidator } from "./namespace";

const { log } = console;
enum STATUS {
  active = "active",
  terminated = "terminated",
}
// Kamil is an iterable ds
export default class Kamil extends ZipCodeValidator {
  public readonly me = "1234";
  private iter = 0;
  protected values = [1, 2, 3];
  public status = STATUS.active;
  protected readonly read = "some text";
  constructor() {
    super();
  }

  protected static *myGenFunc() {
    console.log("main");
    yield 101;
    yield 10;
    return 100000;
  }

  public [Symbol.iterator]() {
    return {
      // comforms
      next: () => {
        if (this.status === STATUS.terminated) {
          log(
            "\x1b[31m%s\x1b[0m",
            "[X] Error iterating over an object.",
            `Location (${__filename})`
          );
          log("[X] Reason: Status is", this.status.toUpperCase());
          log(
            "P.S. You might wanna change your status in the settings or else abandon the project altogether to create a new one"
          );
          console.groupEnd();
          return { done: true, value: this.iter };
        }

        if (this.iter >= this.values.length) {
          this.iter = 0;
          return { done: true, value: this.iter };
        }
        const result = { done: false, value: this.iter };
        this.iter++;
        return result;
      },
    };
  }
}

class Check extends Kamil {
  public static readonly text = "some text";
  constructor(public mine: string = "my class my rules") {
    super();
    this.status = STATUS.active;
  }
}
export const me = new Kamil();

// The function* declaration (function keyword followed by an asterisk) defines a generator function, which returns a Generator object.

// The Generator object is returned by a generator function and it conforms to both the
// iterable protocol [Symbol.iterator] &
// the iterator protocol next() => ({iter: any, done: boolean }).
