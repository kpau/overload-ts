/// <reference path="types.ts" />
/// <reference path="checkers.ts" />

const [overload, overloads] = (function () {
    function isFunction(fn: any): fn is Function {
        return fn && checkTypeConstructor(fn, Function);
    }

    function isArray<T>(arr: any): arr is T[] {
        return Array.isArray(arr);
    }

    function isOverloadArg(arg: TypeCheck | TypeCheck[] | OverloadArg): arg is OverloadArg {
        return (arg as OverloadArg).type !== undefined;
    }

    function matchOverload(overload: Overload, args: any[]): boolean {
        if (isFunction(overload.args)) {
            return overload.args.apply(null, args);
        }

        // arg.optional?
        const countMatch = args.length === overload.args.length;
        const typeMatch = overload.args.every((olArg, i) => {
            const arg = args[i];
            return olArg.type.some(t => checkType(arg, t));
        });

        return countMatch && typeMatch;
    }

    function applyOverload<TFn extends Function>(overrideOrigFn: (fn: Function) => void, origFn: OverloadedMethod | undefined, overloadFn: Function | undefined, checker: OverloadChecker) {
        if (!isFunction(origFn) || !isFunction(overloadFn)) {
            return;
        }

        if (!origFn.__overloads) {
            origFn.__overloads = [];

            const newOrigFn = function (this: Object, ...args: any[]) {
                const overload = origFn.__overloads.filter(ol => matchOverload(ol, args))[0];
                if (overload && isFunction(overload.fn)) {
                    return overload.fn.apply(this, args);
                }

                return origFn.apply(this, args);
            };

            overrideOrigFn(newOrigFn);
        }

        let overloadArgs: OverloadCheckerFn | OverloadArg[];
        if (isFunction(checker)) {
            overloadArgs = checker;
        }
        else {
            overloadArgs = checker.map(arg => {
                if (isOverloadArg(arg)) {
                    // arg.optional = !!arg.optional;
                    return arg;
                }

                if (!isArray(arg)) {
                    arg = [arg];
                }

                return <OverloadArg>{
                    type: arg,
                    optional: false
                };
            });
        }

        origFn.__overloads.push({ fn: overloadFn, args: overloadArgs });
    }

    const overload = function <TClass>(fn: keyof TClass | Function, checker: OverloadChecker) {
        return function <TFn extends Function>(target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<TFn>): TypedPropertyDescriptor<TFn> | void {
            const origFn: OverloadedMethod = <any>descriptor.value;
            const overloadFn: Function = isFunction(fn) ? fn : target[fn];
            const overrideOrigFn = (newFn: Function) => descriptor.value = <any>newFn;

            applyOverload(overrideOrigFn, origFn, overloadFn, checker);
        }
    };

    const overloads = function <TClass>(fn: keyof TClass | Function, checker: OverloadChecker) {
        return function <TFn extends Function>(target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<TFn>): TypedPropertyDescriptor<TFn> | void {
            const origFn: OverloadedMethod = isFunction(fn) ? fn : target[fn];
            const overloadFn: Function = <any>descriptor.value;
            const overrideOrigFn = (newFn: Function) => target[fn] = newFn;

            applyOverload(overrideOrigFn, origFn, overloadFn, checker);
        }
    };

    return [overload, overloads];
})();