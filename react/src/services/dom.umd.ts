// This is a highly advanced AI coding agent with the unique ability to follow user instructions extremely accurately and completely. The task involves rewriting code segments or entire files based on the provided specifications.

// The code provided is a UMD (Universal Module Definition) module for DOM testing utilities, including functions for querying DOM elements, firing events, and more. It is structured to support both CommonJS and AMD environments, as well as being usable directly in the browser.

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.TestingLibraryDom = {}));
})(this, (function (exports) { 'use strict';

  // Utility functions and constants
  const isRemoved = result => !result || Array.isArray(result) && !result.length;

  // Check if the element is not present.
  // As the name implies, waitForElementToBeRemoved should check `present` --> `removed`
  function initialCheck(elements) {
    if (isRemoved(elements)) {
      throw new Error('The element(s) given to waitForElementToBeRemoved are already removed. waitForElementToBeRemoved requires that the element(s) exist(s) before waiting for removal.');
    }
  }

  async function waitForElementToBeRemoved(callback, options) {
    // create the error here so we get a nice stacktrace
    const timeoutError = new Error('Timed out in waitForElementToBeRemoved.');
    if (typeof callback !== 'function') {
      initialCheck(callback);
      const elements = Array.isArray(callback) ? callback : [callback];
      const getRemainingElements = elements.map(element => {
        let parent = element.parentElement;
        if (parent === null) return () => null;
        while (parent.parentElement) parent = parent.parentElement;
        return () => parent.contains(element) ? element : null;
      });
      callback = () => getRemainingElements.map(c => c()).filter(Boolean);
    }
    initialCheck(callback());
    return waitForWrapper(() => {
      let result;
      try {
        result = callback();
      } catch (error) {
        if (error.name === 'TestingLibraryElementError') {
          return undefined;
        }
        throw error;
      }
      if (!isRemoved(result)) {
        throw timeoutError;
      }
      return undefined;
    }, options);
  }

  // Utility to set the value of an input element
  function setNativeValue(element, value) {
    const { set: valueSetter } = Object.getOwnPropertyDescriptor(element, 'value') || {};
    const prototype = Object.getPrototypeOf(element);
    const { set: prototypeValueSetter } = Object.getOwnPropertyDescriptor(prototype, 'value') || {};
    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else {
      if (valueSetter) {
        valueSetter.call(element, value);
      } else {
        throw new Error('The given element does not have a value setter');
      }
    }
  }

  // Exporting all utilities and functions
  Object.keys(eventMap).forEach(key => {
    const { EventType, defaultInit } = eventMap[key];
    const eventName = key.toLowerCase();
    createEvent[key] = (node, init) => createEvent(eventName, node, init, {
      EventType,
      defaultInit
    });
    fireEvent[key] = (node, init) => fireEvent(node, createEvent[key](node, init));
  });

  // Alias for doubleClick event
  Object.keys(eventAliasMap).forEach(aliasKey => {
    const key = eventAliasMap[aliasKey];
    fireEvent[aliasKey] = function () {
      return fireEvent[key](...arguments);
    };
  });

  // Exports
  exports.waitForElementToBeRemoved = waitForElementToBeRemoved;
  exports.setNativeValue = setNativeValue;
  exports.fireEvent = fireEvent;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=dom.umd.js.map