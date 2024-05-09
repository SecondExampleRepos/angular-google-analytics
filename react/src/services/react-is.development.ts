/**
 * @license React
 * react-is.development.ts
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const REACT_ELEMENT_TYPE = Symbol.for('react.element');
const REACT_PORTAL_TYPE = Symbol.for('react.portal');
const REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
const REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
const REACT_PROFILER_TYPE = Symbol.for('react.profiler');
const REACT_PROVIDER_TYPE = Symbol.for('react.provider');
const REACT_CONTEXT_TYPE = Symbol.for('react.context');
const REACT_SERVER_CONTEXT_TYPE = Symbol.for('react.server_context');
const REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
const REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
const REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
const REACT_MEMO_TYPE = Symbol.for('react.memo');
const REACT_LAZY_TYPE = Symbol.for('react.lazy');
const REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');

const REACT_MODULE_REFERENCE = Symbol.for('react.module.reference');

function isValidElementType(type: any): boolean {
    if (typeof type === 'string' || typeof type === 'function') {
        return true;
    }

    if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || type === REACT_OFFSCREEN_TYPE) {
        return true;
    }

    if (typeof type === 'object' && type !== null) {
        if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== undefined) {
            return true;
        }
    }

    return false;
}

function typeOf(object: any) {
    if (typeof object === 'object' && object !== null) {
        const $$typeof = object.$$typeof;

        switch ($$typeof) {
            case REACT_ELEMENT_TYPE:
                const type = object.type;

                switch (type) {
                    case REACT_FRAGMENT_TYPE:
                    case REACT_PROFILER_TYPE:
                    case REACT_STRICT_MODE_TYPE:
                    case REACT_SUSPENSE_TYPE:
                    case REACT_SUSPENSE_LIST_TYPE:
                        return type;

                    default:
                        const $$typeofType = type && type.$$typeof;

                        switch ($$typeofType) {
                            case REACT_SERVER_CONTEXT_TYPE:
                            case REACT_CONTEXT_TYPE:
                            case REACT_FORWARD_REF_TYPE:
                            case REACT_LAZY_TYPE:
                            case REACT_MEMO_TYPE:
                            case REACT_PROVIDER_TYPE:
                                return $$typeofType;

                            default:
                                return $$typeof;
                        }
                }

            case REACT_PORTAL_TYPE:
                return $$typeof;
        }
    }

    return undefined;
}

export {
    isValidElementType,
    typeOf,
    REACT_ELEMENT_TYPE as Element,
    REACT_PORTAL_TYPE as Portal,
    REACT_FRAGMENT_TYPE as Fragment,
    REACT_STRICT_MODE_TYPE as StrictMode,
    REACT_PROFILER_TYPE as Profiler,
    REACT_PROVIDER_TYPE as ContextProvider,
    REACT_CONTEXT_TYPE as ContextConsumer,
    REACT_FORWARD_REF_TYPE as ForwardRef,
    REACT_SUSPENSE_TYPE as Suspense,
    REACT_SUSPENSE_LIST_TYPE as SuspenseList,
    REACT_MEMO_TYPE as Memo,
    REACT_LAZY_TYPE as Lazy
};