// the declared types in here is for typesafty and intellisense
// they are not an actual code pieces

// declare keyword is not necessary but it helps visualize that this file just a facade and no code will be emitted by TS compile. The author has to be provide the real code, for example, in a <link /> tag which is attached in HTML.
// accessed as a namespace
declare namespace TestAdd {
  class Cal {
    public doAdd(a: number, b: number): number;
  }
}

//accessed as module useing import
declare module "Test" {
  class Cal {
    private doAdd(a: number, b: number): number;
    public me: number;
  }
}

interface NodeJS {
  helloWorld(): void;
}

interface Bro {
  uBro: boolean;
}
