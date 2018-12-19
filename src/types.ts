type TypeCheckerFn = (obj: any) => boolean;

type TypeCheckerFnGeneric<T> = (obj: any) => obj is T;

interface TypeVerifier {
    isType: TypeCheckerFn;
}

interface TypeVerifierGeneric<T> {
    isType: TypeCheckerFnGeneric<T>;
}

type TypeVerifierExtend<T> = TypeVerifierGeneric<T> & T;

type TypeOfValues = 'undefined' | 'object' | 'boolean' | 'number' | 'string' | 'symbol' | 'function';

type TypeCheck = Function | TypeVerifier | TypeVerifierGeneric<any> | TypeOfValues | TypeCheckerFn | TypeCheckerFnGeneric<any>;

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
