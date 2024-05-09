/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

type ModuleRegistry = { [uri: string]: Promise<any> };

class ModuleLoader {
  private registry: ModuleRegistry = {};

  constructor(private amdFunctionName: string, private useEval: boolean) {
    if (!(self as any)[this.amdFunctionName]) {
      (self as any)[this.amdFunctionName] = this.loadModule.bind(this);
    }
  }

  private async singleRequire(uri: string, parentUri: string): Promise<any> {
    uri = new URL(uri + ".js", parentUri).href;
    if (!this.registry[uri]) {
      this.registry[uri] = this.useEval ? this.fetchAndEval(uri) : this.loadWithScriptTag(uri);
    }
    return this.registry[uri].then(() => {
      let promise = this.registry[uri];
      if (!promise) {
        throw new Error(`Module ${uri} didn’t register its module`);
      }
      return promise;
    });
  }

  private fetchAndEval(uri: string): Promise<void> {
    return fetch(uri)
      .then(resp => resp.text())
      .then(code => {
        (self as any).nextDefineUri = uri;
        eval(code);
      });
  }

  private loadWithScriptTag(uri: string): Promise<void> {
    return new Promise(resolve => {
      if ("document" in self) {
        const script = document.createElement("script");
        script.src = uri;
        script.onload = resolve;
        document.head.appendChild(script);
      } else {
        (self as any).nextDefineUri = uri;
        importScripts(uri);
        resolve();
      }
    });
  }

  private loadModule(depsNames: string[], factory: (...deps: any[]) => void): void {
    const uri = (self as any).nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (this.registry[uri]) {
      return;
    }
    let exports: any = {};
    const require = (depUri: string) => this.singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    this.registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  }
}