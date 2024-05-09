import React from 'react';

type HelperFunction = (...args: any[]) => any;

interface Helpers {
  [key: string]: HelperFunction;
}

const helpers: Helpers = {
  asyncToGenerator: (fn: Function) => {
    return function(this: any) {
      const self = this;
      const args = arguments;
      return new Promise((resolve, reject) => {
        const gen = fn.apply(self, args);
        function _next(value: any) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err: any) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(undefined);
      });
    };
  },

  classCallCheck: (instance: any, Constructor: Function) => {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  },

  createClass: (Constructor: Function, protoProps: PropertyDescriptor[], staticProps: PropertyDescriptor[]) => {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", { writable: false });
    return Constructor;
  },

  defineProperty: (obj: any, key: PropertyKey, value: any) => {
    key = toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  },

  extends: (...args: any[]) => {
    return Object.assign({}, ...args);
  },

  inherits: (subClass: any, superClass: Function) => {
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf(subClass, superClass);
  },

  // Additional helpers can be defined here
};

function asyncGeneratorStep(gen: any, resolve: Function, reject: Function, _next: Function, _throw: Function, key: string, arg: any) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function defineProperties(target: any, props: PropertyDescriptor[]) {
  for (let i = 0; i < props.length; i++) {
    const descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, toPropertyKey(descriptor.key), descriptor);
  }
}

function toPropertyKey(key: any): PropertyKey {
  return key;
}

export default helpers;