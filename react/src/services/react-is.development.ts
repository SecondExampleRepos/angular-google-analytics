type ReactType = string | Function | object | symbol;

export class ReactTypeChecker {
  private static hasSymbol = typeof Symbol === 'function' && Symbol.for;

  private static REACT_ELEMENT_TYPE = ReactTypeChecker.hasSymbol ? Symbol.for('react.element') : 0xeac7;
  private static REACT_PORTAL_TYPE = ReactTypeChecker.hasSymbol ? Symbol.for('react.portal') : 0xeaca;
  private static REACT_FRAGMENT_TYPE = ReactTypeChecker.hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
  private static REACT_STRICT_MODE_TYPE = ReactTypeChecker.hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
  private static REACT_PROFILER_TYPE = ReactTypeChecker.hasSymbol ? Symbol.for('react.profiler') : 0xead2;
  private static REACT_PROVIDER_TYPE = ReactTypeChecker.hasSymbol ? Symbol.for('react.provider') : 0xeacd;
  private static REACT_CONTEXT_TYPE = ReactTypeChecker.hasSymbol ? Symbol.for('react.context') : 0xeace;
  private static REACT_FORWARD_REF_TYPE = ReactTypeChecker.hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
  private static REACT_SUSPENSE_TYPE = ReactTypeChecker.hasSymbol ? Symbol.for('react.suspense') : 0xead1;
  private static REACT_MEMO_TYPE = ReactTypeChecker.hasSymbol ? Symbol.for('react.memo') : 0xead3;
  private static REACT_LAZY_TYPE = ReactTypeChecker.hasSymbol ? Symbol.for('react.lazy') : 0xead4;

  public static isValidElementType(type: ReactType): boolean {
    return typeof type === 'string' || typeof type === 'function' ||
      type === ReactTypeChecker.REACT_FRAGMENT_TYPE ||
      type === ReactTypeChecker.REACT_PROFILER_TYPE ||
      type === ReactTypeChecker.REACT_STRICT_MODE_TYPE ||
      type === ReactTypeChecker.REACT_SUSPENSE_TYPE ||
      typeof type === 'object' && type !== null && (
        type['$$typeof'] === ReactTypeChecker.REACT_LAZY_TYPE ||
        type['$$typeof'] === ReactTypeChecker.REACT_MEMO_TYPE ||
        type['$$typeof'] === ReactTypeChecker.REACT_PROVIDER_TYPE ||
        type['$$typeof'] === ReactTypeChecker.REACT_CONTEXT_TYPE ||
        type['$$typeof'] === ReactTypeChecker.REACT_FORWARD_REF_TYPE
      );
  }

  public static typeOf(object: any): symbol | undefined {
    if (typeof object === 'object' && object !== null) {
      const $$typeof = object['$$typeof'];

      switch ($$typeof) {
        case ReactTypeChecker.REACT_ELEMENT_TYPE:
          return $$typeof;
        case ReactTypeChecker.REACT_PORTAL_TYPE:
          return $$typeof;
        default:
          return undefined;
      }
    }

    return undefined;
  }

  // Additional methods to check specific types can be added here
}
