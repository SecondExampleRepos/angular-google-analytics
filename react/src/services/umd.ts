type MergeOptions = {
    clone?: boolean;
    arrayMerge?: (target: any[], source: any[], options?: MergeOptions) => any[];
    isMergeableObject?: (value: any) => boolean;
    customMerge?: (key: string) => (left: any, right: any, options?: MergeOptions) => any;
};

const isMergeableObject = (value: any): boolean => {
    return isNonNullObject(value) && !isSpecial(value);
};

const isNonNullObject = (value: any): boolean => {
    return !!value && typeof value === 'object';
};

const isSpecial = (value: any): boolean => {
    const stringValue = Object.prototype.toString.call(value);
    return stringValue === '[object RegExp]' || stringValue === '[object Date]' || isReactElement(value);
};

const canUseSymbol = typeof Symbol === 'function' && Symbol.for;
const REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

const isReactElement = (value: any): boolean => {
    return value.$$typeof === REACT_ELEMENT_TYPE;
};

const emptyTarget = (val: any): any => {
    return Array.isArray(val) ? [] : {};
};

const cloneUnlessOtherwiseSpecified = (value: any, options: MergeOptions): any => {
    return (options.clone !== false && options.isMergeableObject && options.isMergeableObject(value))
        ? deepmerge(emptyTarget(value), value, options)
        : value;
};

const defaultArrayMerge = (target: any[], source: any[], options: MergeOptions): any[] => {
    return target.concat(source).map(element => cloneUnlessOtherwiseSpecified(element, options));
};

const getMergeFunction = (key: string, options: MergeOptions): any => {
    if (!options.customMerge) {
        return deepmerge;
    }
    const customMerge = options.customMerge(key);
    return typeof customMerge === 'function' ? customMerge : deepmerge;
};

const getEnumerableOwnPropertySymbols = (target: any): any[] => {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(symbol => Object.propertyIsEnumerable.call(target, symbol)) : [];
};

const getKeys = (target: any): any[] => {
    return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
};

const propertyIsOnObject = (object: any, property: string): boolean => {
    try {
        return property in object;
    } catch {
        return false;
    }
};

const propertyIsUnsafe = (target: any, key: string): boolean => {
    return propertyIsOnObject(target, key) && !(Object.hasOwnProperty.call(target, key) && Object.propertyIsEnumerable.call(target, key));
};

const mergeObject = (target: any, source: any, options: MergeOptions): any => {
    const destination: any = {};
    if (options.isMergeableObject && options.isMergeableObject(target)) {
        getKeys(target).forEach(key => {
            destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
        });
    }
    getKeys(source).forEach(key => {
        if (propertyIsUnsafe(target, key)) {
            return;
        }

        if (propertyIsOnObject(target, key) && options.isMergeableObject && options.isMergeableObject(source[key])) {
            destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
        } else {
            destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
        }
    });
    return destination;
};

const deepmerge = (target: any, source: any, options: MergeOptions = {}): any => {
    options.arrayMerge = options.arrayMerge || defaultArrayMerge;
    options.isMergeableObject = options.isMergeableObject || isMergeableObject;
    options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

    const sourceIsArray = Array.isArray(source);
    const targetIsArray = Array.isArray(target);
    const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

    if (!sourceAndTargetTypesMatch) {
        return cloneUnlessOtherwiseSpecified(source, options);
    } else if (sourceIsArray) {
        return options.arrayMerge(target, source, options);
    } else {
        return mergeObject(target, source, options);
    }
};

deepmerge.all = (array: any[], options: MergeOptions = {}): any => {
    if (!Array.isArray(array)) {
        throw new Error('first argument should be an array');
    }

    return array.reduce((prev, next) => deepmerge(prev, next, options), {});
};

export default deepmerge;