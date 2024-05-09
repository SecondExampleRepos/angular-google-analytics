import { useState, useEffect } from 'react';

type Utils = {
  injectGlobalImport: (url: string, moduleName: string) => void;
  injectNamedImport: (url: string, name: string, hint?: string, moduleName?: string) => void;
  injectDefaultImport: (url: string, hint?: string, moduleName?: string) => void;
};

class ImportsCachedInjector {
  private imports: Map<string, string>;
  private anonymousImports: Set<string>;
  private lastImports: Array<{ path: string; index: number }>;
  private resolver: (url: string) => string;
  private getPreferredIndex: (url: string) => number;

  constructor(resolver: (url: string) => string, getPreferredIndex: (url: string) => number) {
    this.imports = new Map();
    this.anonymousImports = new Set();
    this.lastImports = [];
    this.resolver = resolver;
    this.getPreferredIndex = getPreferredIndex;
  }

  storeAnonymous(programPath: string, url: string, moduleName: string, getVal: (isScript: boolean, source: string) => any) {
    const key = this.normalizeKey(programPath, url);
    if (this.anonymousImports.has(key)) return;

    const node = getVal(programPath === "script", this.resolver(url));
    this.anonymousImports.add(key);
    this.injectImport(programPath, node, moduleName);
  }

  storeNamed(programPath: string, url: string, name: string, moduleName: string, getVal: (isScript: boolean, source: string, name: string) => { node: any; name: string }) {
    const key = this.normalizeKey(programPath, url, name);
    if (!this.imports.has(key)) {
      const { node, name: id } = getVal(programPath === "script", this.resolver(url), name);
      this.imports.set(key, id);
      this.injectImport(programPath, node, moduleName);
    }

    return this.imports.get(key);
  }

  private injectImport(programPath: string, node: any, moduleName: string) {
    const newIndex = this.getPreferredIndex(moduleName);
    const lastImports = this.lastImports;

    let last: any;

    if (newIndex === Infinity) {
      if (lastImports.length > 0) {
        last = lastImports[lastImports.length - 1].path;
      }
    } else {
      for (const [i, data] of lastImports.entries()) {
        if (newIndex < data.index) {
          const newPath = { path: node, index: newIndex };
          lastImports.splice(i, 0, newPath);
          return;
        }
        last = data.path;
      }
    }

    if (last) {
      const newPath = { path: node, index: newIndex };
      lastImports.push(newPath);
    } else {
      const newPath = { path: node, index: newIndex };
      this.lastImports.push(newPath);
    }
  }

  private normalizeKey(programPath: string, url: string, name: string = ""): string {
    return `${name}::${url}::${name}`;
  }
}

function useUtilsGetter(cache: ImportsCachedInjector) {
  const [utils, setUtils] = useState<Utils | null>(null);

  useEffect(() => {
    const utils: Utils = {
      injectGlobalImport: (url, moduleName) => {
        cache.storeAnonymous("script", url, moduleName, (isScript, source) => {
          return isScript ? `require(${source})` : `import ${source}`;
        });
      },
      injectNamedImport: (url, name, hint = name, moduleName) => {
        cache.storeNamed("script", url, name, moduleName, (isScript, source, name) => {
          return {
            node: isScript ? `var ${name} = require(${source}).${name}` : `import { ${name} } from '${source}'`,
            name: name,
          };
        });
      },
      injectDefaultImport: (url, hint = url, moduleName) => {
        cache.storeNamed("script", url, "default", moduleName, (isScript, source) => {
          return {
            node: isScript ? `var ${hint} = require(${source})` : `import ${hint} from '${source}'`,
            name: hint,
          };
        });
      },
    };

    setUtils(utils);
  }, [cache]);

  return utils;
}

export { ImportsCachedInjector, useUtilsGetter };