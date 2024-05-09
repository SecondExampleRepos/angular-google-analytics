import { deprecate } from 'util';

type FactoryFunction<T> = (key: string, hook: T) => T;
type Interceptor<T> = {
    factory: FactoryFunction<T>;
};

class HookMap<T> {
    private _map: Map<string, T>;
    public name?: string;
    private _factory: FactoryFunction<T>;
    private _interceptors: Interceptor<T>[];

    constructor(factory: FactoryFunction<T>, name?: string) {
        this._map = new Map<string, T>();
        this.name = name;
        this._factory = factory;
        this._interceptors = [];
    }

    get(key: string): T | undefined {
        return this._map.get(key);
    }

    for(key: string): T {
        let hook = this.get(key);
        if (hook !== undefined) {
            return hook;
        }
        let newHook = this._factory(key, hook as T);
        this._interceptors.forEach(interceptor => {
            newHook = interceptor.factory(key, newHook);
        });
        this._map.set(key, newHook);
        return newHook;
    }

    intercept(interceptor: Interceptor<T>): void {
        this._interceptors.push({
            factory: interceptor.factory || ((key, hook) => hook),
        });
    }

    tap(key: string, options: any, fn: Function): void {
        const hook = this.for(key);
        if ('tap' in hook) {
            (hook as any).tap(options, fn);
        }
    }

    tapAsync(key: string, options: any, fn: Function): void {
        const hook = this.for(key);
        if ('tapAsync' in hook) {
            (hook as any).tapAsync(options, fn);
        }
    }

    tapPromise(key: string, options: any, fn: Function): void {
        const hook = this.for(key);
        if ('tapPromise' in hook) {
            (hook as any).tapPromise(options, fn);
        }
    }
}

const deprecatedTap = deprecate(HookMap.prototype.tap, "HookMap#tap(key,…) is deprecated. Use HookMap#for(key).tap(…) instead.");
const deprecatedTapAsync = deprecate(HookMap.prototype.tapAsync, "HookMap#tapAsync(key,…) is deprecated. Use HookMap#for(key).tapAsync(…) instead.");
const deprecatedTapPromise = deprecate(HookMap.prototype.tapPromise, "HookMap#tapPromise(key,…) is deprecated. Use HookMap#for(key).tapPromise(…) instead.");

export default HookMap;