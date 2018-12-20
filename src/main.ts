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

    /**
     * Check if the given overload signature matches the given arguments.
     */
    function matchOverload(overload: Overload, args: any[]): boolean {
        if (isFunction(overload.args)) {
            return overload.args.apply(null, args);
        }

        // TODO: arg.optional?

        // check arguments length
        const countMatch = args.length === overload.args.length;
        // check arguments types
        const typeMatch = overload.args.every((olArg, i) => {
            const arg = args[i];
            return olArg.type.some(t => checkType(arg, t));
        });

        // if argument count and types match - the overload matches
        return countMatch && typeMatch;
    }

    /**
     * Add overload for the given method.
     * @param overrideOrigFn Callback to override the original method in order to call overloads.
     * @param origFn The original method that will be overloaded. Will fallback to it if no overload matches.
     * @param overloadFn The overload method, that will be executed if signature matches.
     * @param checker Overload definition which is used to determine if the overload matches a specific call.
     */
    function applyOverload<TFn extends Function>(overrideOrigFn: (fn: Function) => void, origFn: OverloadedMethod | undefined, overloadFn: Function | undefined, checker: OverloadChecker) {
        if (!isFunction(origFn) || !isFunction(overloadFn)) {
            return;
        }

        // if this is the first overload, we must override the method
        // so we can check for overloads on each call, before executing the method itself
        if (!origFn.__overloads) {
            origFn.__overloads = [];

            const newOrigFn = function (this: Object, ...args: any[]) {
                // search for overloads that match, and take the first one
                const overload = origFn.__overloads.filter(ol => matchOverload(ol, args))[0];
                // if there is a matching overload, execute it
                if (overload && isFunction(overload.fn)) {
                    return overload.fn.apply(this, args);
                }

                // otherwise execute original method
                return origFn.apply(this, args);
            };

            overrideOrigFn(newOrigFn);
        }

        // add overload definition for the method
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
                    type: arg
                    // optional: false
                };
            });
        }

        origFn.__overloads.push({ fn: overloadFn, args: overloadArgs });
    }

    /**
     * Add overload for the current method.
     * The decorated method is the one that is overloaded.
     * @param fn The overload method. Either its name in the current class, or specific function.
     * @param checker Overload definition. Used to determine when the overload matches a specific call and execute it.
     * @returns Decorates the current method and adds overload.
     */
    function overload<TClass>(fn: keyof TClass | Function, checker: OverloadChecker) {
        return function <TFn extends Function>(target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<TFn>): TypedPropertyDescriptor<TFn> | void {
            // the decorated method is the one being overloaded
            const origFn: OverloadedMethod = <any>descriptor.value;
            // the given method is the overload
            const overloadFn: Function = isFunction(fn) ? fn : target[fn];
            // overrides the decorated method
            const overrideOrigFn = (newFn: Function) => descriptor.value = <any>newFn;

            applyOverload(overrideOrigFn, origFn, overloadFn, checker);
        }
    };

    /**
     * Add overload for the given method.
     * The decorated method is the overload.
     * @param fn The original method being overloaded. Must be the a name of the method in the current class.
     * @param checker Overload definition. Used to determine when the overload matches a specific call and execute it.
     * @returns Decorates the current method as overload of the provided method. 
     */
    function overloads<TClass>(fn: keyof TClass, checker: OverloadChecker) {
        return function <TFn extends Function>(target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<TFn>): TypedPropertyDescriptor<TFn> | void {
            // the given method is the one being overloaded
            const origFn: OverloadedMethod = isFunction(fn) ? fn : target[fn];
            // the decorated method is the overload
            const overloadFn: Function = <any>descriptor.value;
            // overrides the given method
            const overrideOrigFn = (newFn: Function) => target[fn] = newFn;

            applyOverload(overrideOrigFn, origFn, overloadFn, checker);
        }
    };

    return [overload, overloads];
})();