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
    const lastImport = this.lastImports.find(({ path }) => path === programPath);
    if (lastImport && newIndex >= lastImport.index) {
      this.lastImports.push({ path: programPath, index: newIndex });
    } else {
      this.lastImports.unshift({ path: programPath, index: newIndex });
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
        cache.storeAnonymous("global", url, moduleName, (isScript, source) => {
          return isScript ? `require(${source})` : `import ${moduleName} from '${source}'`;
        });
      },
      injectNamedImport: (url, name, hint = name, moduleName) => {
        cache.storeNamed("named", url, name, moduleName, (isScript, source, name) => {
          return {
            node: isScript ? `var ${hint} = require(${source}).${name}` : `import { ${name} as ${hint} } from '${source}'`,
            name: hint
          };
        });
      },
      injectDefaultImport: (url, hint = url, moduleName) => {
        cache.storeNamed("default", url, "default", moduleName, (isScript, source) => {
          return {
            node: isScript ? `var ${hint} = require(${source})` : `import ${hint} from '${source}'`,
            name: hint
          };
        });
      }
    };

    setUtils(utils);
  }, [cache]);

  return utils;
}

export default useUtilsGetter;