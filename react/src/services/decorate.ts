import toArray from "./toArray.js";
import toPropertyKey from "./toPropertyKey.js";

interface ElementDescriptor {
  kind: string;
  key: PropertyKey;
  placement: string;
  descriptor: PropertyDescriptor;
  initializer?: () => any;
  decorators?: any[];
}

interface ClassDescriptor {
  kind: string;
  elements: ElementDescriptor[];
}

interface FinisherExtras {
  element: ElementDescriptor;
  finisher?: () => any;
  extras?: ElementDescriptor[];
}

class DecoratorsApi {
  elementsDefinitionOrder = [["method"], ["field"]];

  initializeInstanceElements(O: any, elements: ElementDescriptor[]) {
    ["method", "field"].forEach(kind => {
      elements.forEach(element => {
        if (element.kind === kind && element.placement === "own") {
          this.defineClassElement(O, element);
        }
      });
    });
  }

  initializeClassElements(F: Function, elements: ElementDescriptor[]) {
    const proto = F.prototype;
    ["method", "field"].forEach(kind => {
      elements.forEach(element => {
        const placement = element.placement;
        const receiver = placement === "static" ? F : proto;
        if (element.kind === kind && (placement === "static" || placement === "prototype")) {
          this.defineClassElement(receiver, element);
        }
      });
    });
  }

  defineClassElement(receiver: any, element: ElementDescriptor) {
    let descriptor = element.descriptor;
    if (element.kind === "field") {
      const initializer = element.initializer;
      descriptor = {
        enumerable: descriptor.enumerable,
        writable: descriptor.writable,
        configurable: descriptor.configurable,
        value: initializer === undefined ? undefined : initializer.call(receiver)
      };
    }
    Object.defineProperty(receiver, element.key, descriptor);
  }

  decorateClass(elements: ElementDescriptor[], decorators?: Function[]): { elements: ElementDescriptor[], finishers: Function[] } {
    const newElements: ElementDescriptor[] = [];
    const finishers: Function[] = [];
    const placements: { [key: string]: PropertyKey[] } = { "static": [], prototype: [], own: [] };

    elements.forEach(element => {
      this.addElementPlacement(element, placements);
    });

    elements.forEach(element => {
      if (!this.hasDecorators(element)) return newElements.push(element);
      const elementFinishersExtras = this.decorateElement(element, placements);
      newElements.push(elementFinishersExtras.element);
      newElements.push(...elementFinishersExtras.extras);
      finishers.push(...elementFinishersExtras.finishers);
    });

    if (!decorators) {
      return { elements: newElements, finishers: finishers };
    }

    const result = this.decorateConstructor(newElements, decorators);
    finishers.push(...result.finishers);
    result.finishers = finishers;
    return result;
  }

  addElementPlacement(element: ElementDescriptor, placements: { [key: string]: PropertyKey[] }, silent?: boolean) {
    const keys = placements[element.placement];
    if (!silent && keys.indexOf(element.key) !== -1) {
      throw new TypeError(`Duplicated element (${String(element.key)})`);
    }
    keys.push(element.key);
  }

  decorateElement(element: ElementDescriptor, placements: { [key: string]: PropertyKey[] }): FinisherExtras {
    const extras: ElementDescriptor[] = [];
    const finishers: Function[] = [];
    const decorators = element.decorators!;
    for (let i = decorators.length - 1; i >= 0; i--) {
      const keys = placements[element.placement];
      keys.splice(keys.indexOf(element.key), 1);
      const elementObject = this.fromElementDescriptor(element);
      const elementFinisherExtras = this.toElementFinisherExtras(decorators[i](elementObject) || elementObject);
      element = elementFinisherExtras.element;
      this.addElementPlacement(element, placements);
      if (elementFinisherExtras.finisher) {
        finishers.push(elementFinisherExtras.finisher);
      }
      const newExtras = elementFinisherExtras.extras;
      if (newExtras) {
        for (let j = 0; j < newExtras.length; j++) {
          this.addElementPlacement(newExtras[j], placements);
        }
        extras.push(...newExtras);
      }
    }
    return {
      element: element,
      finishers: finishers,
      extras: extras
    };
  }

  decorateConstructor(elements: ElementDescriptor[], decorators: Function[]): { elements: ElementDescriptor[], finishers: Function[] } {
    const finishers: Function[] = [];
    for (let i = decorators.length - 1; i >= 0; i--) {
      const obj = this.fromClassDescriptor(elements);
      const elementsAndFinisher = this.toClassDescriptor(decorators[i](obj) || obj);
      if (elementsAndFinisher.finisher !== undefined) {
        finishers.push(elementsAndFinisher.finisher);
      }
      if (elementsAndFinisher.elements !== undefined) {
        elements = elementsAndFinisher.elements;
        for (let j = 0; j < elements.length - 1; j++) {
          for (let k = j + 1; k < elements.length; k++) {
            if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) {
              throw new TypeError(`Duplicated element (${String(elements[j].key)})`);
            }
          }
        }
      }
    }
    return {
      elements: elements,
      finishers: finishers
    };
  }

  fromElementDescriptor(element: ElementDescriptor): any {
    const obj = {
      kind: element.kind,
      key: element.key,
      placement: element.placement,
      descriptor: element.descriptor
    };
    const desc = {
      value: "Descriptor",
      configurable: true
    };
    Object.defineProperty(obj, Symbol.toStringTag, desc);
    if (element.kind === "field") obj.initializer = element.initializer;
    return obj;
  }

  toElementDescriptors(elementObjects: any[]): ElementDescriptor[] | undefined {
    if (elementObjects === undefined) return;
    return toArray(elementObjects).map(elementObject => {
      const element = this.toElementDescriptor(elementObject);
      this.disallowProperty(elementObject, "finisher", "An element descriptor");
      this.disallowProperty(elementObject, "extras", "An element descriptor");
      return element;
    });
  }

  toElementDescriptor(elementObject: any): ElementDescriptor {
    const kind = String(elementObject.kind);
    if (kind !== "method" && kind !== "field") {
      throw new TypeError(`An element descriptor's .kind property must be either "method" or "field", but a decorator created an element descriptor with .kind "${kind}"`);
    }
    const key = toPropertyKey(elementObject.key);
    const placement = String(elementObject.placement);
    if (placement !== "static" && placement !== "prototype" && placement !== "own") {
      throw new TypeError(`An element descriptor's .placement property must be one of "static", "prototype" or "own", but a decorator created an element descriptor with .placement "${placement}"`);
    }
    const descriptor = elementObject.descriptor;
    this.disallowProperty(elementObject, "elements", "An element descriptor");
    const element: ElementDescriptor = {
      kind: kind,
      key: key,
      placement: placement,
      descriptor: Object.assign({}, descriptor)
    };
    if (kind !== "field") {
      this.disallowProperty(elementObject, "initializer", "A method descriptor");
    } else {
      this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor");
      this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor");
      this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor");
      element.initializer = elementObject.initializer;
    }
    return element;
  }

  toElementFinisherExtras(elementObject: any): FinisherExtras {
    const element = this.toElementDescriptor(elementObject);
    const finisher = this.optionalCallableProperty(elementObject, "finisher");
    const extras = this.toElementDescriptors(elementObject.extras);
    return {
      element: element,
      finisher: finisher,
      extras: extras
    };
  }

  fromClassDescriptor(elements: ElementDescriptor[]): any {
    const obj = {
      kind: "class",
      elements: elements.map(this.fromElementDescriptor, this)
    };
    const desc = {
      value: "Descriptor",
      configurable: true
    };
    Object.defineProperty(obj, Symbol.toStringTag, desc);
    return obj;
  }

  toClassDescriptor(obj: any): { elements: ElementDescriptor[], finisher?: Function } {
    const kind = String(obj.kind);
    if (kind !== "class") {
      throw new TypeError(`A class descriptor's .kind property must be "class", but a decorator created a class descriptor with .kind "${kind}"`);
    }
    this.disallowProperty(obj, "key", "A class descriptor");
    this.disallowProperty(obj, "placement", "A class descriptor");
    this.disallowProperty(obj, "descriptor", "A class descriptor");
    this.disallowProperty(obj, "initializer", "A class descriptor");
    this.disallowProperty(obj, "extras", "A class descriptor");
    const finisher = this.optionalCallableProperty(obj, "finisher");
    const elements = this.toElementDescriptors(obj.elements);
    return {
      elements: elements!,
      finisher: finisher
    };
  }

  runClassFinishers(constructor: Function, finishers: Function[]): Function {
    for (let i = 0; i < finishers.length; i++) {
      const newConstructor = finishers[i](constructor);
      if (newConstructor !== undefined) {
        if (typeof newConstructor !== "function") {
          throw new TypeError("Finishers must return a constructor.");
        }
        constructor = newConstructor;
      }
    }
    return constructor;
  }

  disallowProperty(obj: any, name: string, objectType: string) {
    if (obj[name] !== undefined) {
      throw new TypeError(`${objectType} can't have a .${name} property.`);
    }
  }

  hasDecorators(element: ElementDescriptor): boolean {
    return element.decorators && element.decorators.length > 0;
  }

  optionalCallableProperty(obj: any, name: string): Function | undefined {
    const value = obj[name];
    if (value !== undefined && typeof value !== "function") {
      throw new TypeError(`Expected '${name}' to be a function`);
    }
    return value;
  }
}

export default function decorate(decorators: Function[], factory: (initialize: (O: any) => void) => { d: ElementDescriptor[], F: Function }, superClass?: Function, mixins?: Function[]): Function {
  const api = new DecoratorsApi();
  if (mixins) {
    for (let i = 0; i < mixins.length; i++) {
      api = mixins[i](api);
    }
  }
  const r = factory(function initialize(O: any) {
    api.initializeInstanceElements(O, decorated.elements);
  }, superClass);
  const decorated = api.decorateClass(r.d.map(element => createElementDescriptor(element)), decorators);
  api.initializeClassElements(r.F, decorated.elements);
  return api.runClassFinishers(r.F, decorated.finishers);
}

function createElementDescriptor(def: any): ElementDescriptor {
  const key = toPropertyKey(def.key);
  let descriptor: PropertyDescriptor;
  if (def.kind === "method") {
    descriptor = {
      value: def.value,
      writable: true,
      configurable: true,
      enumerable: false
    };
  } else if (def.kind === "get") {
    descriptor = {
      get: def.value,
      configurable: true,
      enumerable: false
    };
  } else if (def.kind === "set") {
    descriptor = {
      set: def.value,
      configurable: true,
      enumerable: false
    };
  } else if (def.kind === "field") {
    descriptor = {
      configurable: true,
      writable: true,
      enumerable: true
    };
  }
  const element: ElementDescriptor = {
    kind: def.kind === "field" ? "field" : "method",
    key: key,
    placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype",
    descriptor: descriptor
  };
  if (def.decorators) element.decorators = def.decorators;
  if (def.kind === "field") element.initializer = def.value;
  return element;
}