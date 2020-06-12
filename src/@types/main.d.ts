// the declared types in here is for typesafty and intellisense
// they are not an actual code pieces
// accessed as a namespace
declare namespace TestAdd {
  class Cal {
    private doAdd(a: number, b: number): number;
  }
}

//accessed as module useing import
declare module "Test" {
  class Cal {
    private doAdd(a: number, b: number): number;
    public me = 123;
  }
}
