/// <reference path="main.ts" />

interface ISome {
    int: number;
}

let some: TypeVerifierExtend<ISome> = {
    int: 5,
    isType(obj: any): obj is any { return typeof obj.int === 'number' }
};

class Animal {
    name: string;
    constructor(name: string) {
        this.name = name;
    }

    run() {
        return 1;
    }
}

class Person extends Animal {
    name: string;
    constructor(name: string) {
        super(name);
        this.name = name;
    }

    test(): number;
    test(num: number): number;
    test(txt: string): string;
    test(a: number, b: number): number;
    test(p: Person): number;
    @overload<Person>(Person.prototype.test2, [{type: ['string']}])
    @overload<Person>('testAdd', ['number', 'number'])
    public test(): any {
        return 0;
    }

    @overloads<Person>('test', ['number'])
    @overloads<Person>('run', ['number'])
    private test1(num: number) {
        return num * num;
    }

    private test2(txt: string) {
        return txt + 'test';
    }

    testAdd(a: number, b: number) {
        return a + b;
    }

    @overloads<Person>('test', [Person])
    private test4(p: Person) {
        return p.test(3);
    }
}


const p = new Person('test');
let a = p.test();
console.log('a', a, 0);
let b = p.test(2);
console.log('b', b, 4);
let c = p.test('text');
console.log('c', c, 'texttest');
let d = p.test(3, 4);
console.log('d', d, 7);
let e = p.test(p);
console.log('e', e, 9);
