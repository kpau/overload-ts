/// <reference path="../src/main.ts" />
/// <reference path="./assert.ts" />

interface ISome {
    int: 3;
    get(): number;
}

let some: ISome = {
    int: 3,
    get: function () { return this.int }
};

let isSome: TypeCheckerFn = (obj: any): boolean => obj && obj.int === 3;

let verifiableSome: TypeVerifier = {
    isType: isSome
};

function isLongNumbersArray(...args: any[]) {
    return args.every(a => typeof a === 'number') && args.length > 5;
}

class Test {
    public test(): number;
    public test(num: number): number;
    public test(txt: string): string;
    public test(a: number, b: number): number;
    public test(p: Test): number;
    public test(s: ISome): number;
    public test(s: ISome, n: number): number;
    // this TS overload is added to handle ...number: number[] where length is <= 5
    public test(a?: number, b?: number, c?: number, d?: number, e?: number): number;
    public test(...numbers: number[]): string;
    @overload<Test>(Test.prototype.testConcat, [{ type: ['string'] }])
    @overload<Test>('testAdd', ['number', 'number'])
    @overload<Test>(Test.prototype.testSome, [isSome])
    @overload<Test>(Test.prototype.testArgs, isLongNumbersArray)
    public test(): any {
        return 0;
    }

    @overloads<Test>('test', ['number'])
    private testMultiply(num: number) {
        return num * num;
    }

    private testConcat(txt: string) {
        return txt + 'test';
    }

    testAdd(a: number, b: number) {
        return a + b;
    }

    @overloads<Test>('test', [Test])
    private testTest(p: Test) {
        return p.test(3);
    }

    private testSome(s: ISome) {
        return s.get();
    }

    @overloads<Test>('test', [verifiableSome, 'number'])
    private testVerifiableSome(s: ISome, n: number) {
        return s.get() + n;
    }

    private testArgs(...numbers: number[]): string {
        return numbers.join();
    }
}

const t = new Test();
let a = t.test();
assert.equal(a, 0, 'a');

let b = t.test(2);
assert.equal(b, 4, 'b');

let c = t.test('text');
assert.equal(c, 'texttest', 'c');

let d = t.test(3, 4);
assert.equal(d, 7, 'd');

let e = t.test(t);
assert.equal(e, 9, 'e');

let f = t.test(some);
assert.equal(f, 3, 'f');

let g = t.test(some, 7);
assert.equal(g, 10, 'g');

let h = t.test(1, 2, 3, 4);
assert.equal(h, 0, 'h');

let i = t.test(1, 2, 3, 4, 5, 6);
assert.equal(i, '1,2,3,4,5,6', 'i');