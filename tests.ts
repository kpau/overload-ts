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

    test(n: number): void;
    test(s: string): void;
    @overload<Person>(Person.prototype.test2, [{type: ['string']}])
    @overload<Person>('test3', ['number', 'number'])
    test() {
        return 0;
    }

    @overloads<Person>('test', ['number'])
    @overloads<Person>('run', ['number'])
    test1(num: number) {
        return num * num;
    }

    test2(txt: string) {
        return txt + 'test';
    }

    test3(a: number, b: number) {
        return a + b;
    }

    @overloads<Person>('test', [Person])
    test4(p: Person) {
        return p.test(3);
    }
}


var p = new Person('test');