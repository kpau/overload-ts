type TypeCheckerFn = (obj: any) => boolean;

interface TypeVerifier {
    isType: TypeCheckerFn;
}

type TypeOfValues = 'undefined' | 'object' | 'boolean' | 'number' | 'string' | 'symbol' | 'function';

type TypeCheck = Function | TypeVerifier | TypeOfValues | TypeCheckerFn;

interface OverloadArg {
    type: TypeCheck[];
    // optional?: boolean;
}

interface Overload {
    fn: Function;
    args: OverloadCheckerFn | OverloadArg[];
}

interface OverloadedMethod {
    (...args: any[]): any | void;
    __overloads: Overload[];
}

type OverloadArgs = (TypeCheck | TypeCheck[] | OverloadArg)[];

type OverloadCheckerFn = (...args: any[]) => boolean;

type OverloadChecker = OverloadCheckerFn | OverloadArgs;
