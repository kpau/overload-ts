const assert = (function () {
    function equal(source: any, target: any, message?: string): boolean {
        let msg = `${source === target}\t${source} === ${target}`;
        if (message) {
            msg = `${message}\t${msg}`;
        }

        let print;
        if (source === target) {
            print = console.log;
        }
        else {
            print = console.error;
        }

        print(msg);

        return source === target;
    }

    return {
        equal: equal
    };
})();
