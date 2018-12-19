/// <reference path="types.ts" />

function checkTypeConstructor<T extends Function>(obj: any, ctor: T): obj is T {
    return obj instanceof ctor;
}

function checkTypeFn<T>(obj: any, check: TypeCheckerFn | TypeCheckerFnGeneric<T>): obj is T {
    return check(obj);
}

function checkTypeVerifier<T>(obj: any, typeVerifier: TypeVerifier | TypeVerifierGeneric<T>): obj is T {
    return typeVerifier.isType(obj);
}

function checkTypeOf<T>(obj: any, typeName: TypeOfValues): obj is T {
    return typeof obj === typeName;
}

function checkType<T>(obj: any, checker: TypeCheck): obj is T {
    try {
        if (checkTypeOf<TypeCheckerFnGeneric<T>>(checker, 'function')) {
            return checkTypeConstructor(obj, checker) || checkTypeFn(obj, checker);
        }
        if (checkTypeOf<string>(checker, 'string')) {
            return checkTypeOf(obj, checker);
        }
        if (checkTypeOf<TypeVerifierGeneric<T>>(checker, 'object') && checkTypeOf<Function>(checker.isType, 'function')) {
            return checkTypeVerifier<T>(obj, checker);
        }
    }
    catch { }
    return false;
}
