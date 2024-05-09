import { useState, useEffect } from 'react';

type ImmerState = {
  hasSymbol: boolean;
  hasMap: boolean;
  hasSet: boolean;
  hasProxies: boolean;
  NOTHING: symbol | { 'immer-nothing': boolean };
  DRAFTABLE: symbol | string;
  DRAFT_STATE: symbol | string;
  iteratorSymbol: symbol | string;
  errors: { [key: number]: string | Function };
  die: (error: number, ...args: any[]) => void;
  isDraft: (value: any) => boolean;
  isDraftable: (value: any) => boolean;
  original: (value: any) => any;
};

const useImmerService = () => {
  const [immerState, setImmerState] = useState<ImmerState>({
    hasSymbol: typeof Symbol !== "undefined" && typeof Symbol("x") === "symbol",
    hasMap: typeof Map !== "undefined",
    hasSet: typeof Set !== "undefined",
    hasProxies: typeof Proxy !== "undefined" && typeof Proxy.revocable !== "undefined" && typeof Reflect !== "undefined",
    NOTHING: Symbol.for("immer-nothing"),
    DRAFTABLE: Symbol.for("immer-draftable"),
    DRAFT_STATE: Symbol.for("immer-state"),
    iteratorSymbol: typeof Symbol !== "undefined" && Symbol.iterator || "@@iterator",
    errors: {
      0: "Illegal state",
      1: "Immer drafts cannot have computed properties",
      2: "This object has been frozen and should not be mutated",
      3: (data: any) => `Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? ${data}`,
      4: "An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",
      5: "Immer forbids circular references",
      6: "The first or second argument to `produce` must be a function",
      7: "The third argument to `produce` must be a function or undefined",
      8: "First argument to `createDraft` must be a plain object, an array, or an immerable object",
      9: "First argument to `finishDraft` must be a draft returned by `createDraft`",
      10: "The given draft is already finalized",
      11: "Object.defineProperty() cannot be used on an Immer draft",
      12: "Object.setPrototypeOf() cannot be used on an Immer draft",
      13: "Immer only supports deleting array indices",
      14: "Immer only supports setting array indices and the 'length' property",
      15: (path: string) => `Cannot apply patch, path doesn't resolve: ${path}`,
      16: 'Sets cannot have "replace" patches.',
      17: (op: string) => `Unsupported patch operation: ${op}`,
      18: (plugin: string) => `The plugin for '${plugin}' has not been loaded into Immer. To enable the plugin, import and call 'enable${plugin}()' when initializing your application.`,
      20: "Cannot use proxies if Proxy, Proxy.revocable or Reflect are not available",
      21: (thing: any) => `produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '${thing}'`,
      22: (thing: any) => `'current' expects a draft, got: ${thing}`,
      23: (thing: any) => `'original' expects a draft, got: ${thing}`,
      24: "Patching reserved attributes like __proto__, prototype and constructor is not allowed"
    },
    die: (error: number, ...args: any[]) => {
      throw new Error(`[Immer] ${immerState.errors[error] instanceof Function ? immerState.errors[error](...args) : immerState.errors[error]}`);
    },
    isDraft: (value: any) => !!value && !!value[immerState.DRAFT_STATE],
    isDraftable: (value: any) => {
      if (!value) return false;
      return typeof value === "object" && !Array.isArray(value) && !value[immerState.DRAFTABLE];
    },
    original: (value: any) => {
      if (!immerState.isDraft(value)) immerState.die(23, value);
      return value[immerState.DRAFT_STATE].base_;
    }
  });

  useEffect(() => {
    // Initialize or perform effects based on immerState changes
  }, [immerState]);

  return {
    immerState,
    setImmerState
  };
};

export default useImmerService;