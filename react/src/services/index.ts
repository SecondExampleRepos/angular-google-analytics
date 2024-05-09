import * as babelHelperPluginUtils from '@babel/helper-plugin-utils';
import * as babelHelperCompilationTargets from '@babel/helper-compilation-targets';
import * as utils from './utils';
import ImportsInjector from './imports-injector';
import * as debugUtils from './debug-utils';
import * as normalizeOptions from './normalize-options';
import * as visitors from './visitors';
import * as dependencies from './node/dependencies';
import MetaResolver from './meta-resolver';

type PolyfillProviderOptions = {
    method: string;
    targets?: string | string[] | Record<string, unknown>;
    ignoreBrowserslistConfig?: boolean;
    configPath?: string;
    debug?: boolean;
    shouldInjectPolyfill?: (name: string, shouldInject: boolean) => boolean;
    absoluteImports?: boolean | string;
};

class PolyfillService {
    private getTargets = babelHelperCompilationTargets.default.default || babelHelperCompilationTargets.default;

    private resolveOptions(options: PolyfillProviderOptions, babelApi: any): any {
        const {
            method,
            targets: targetsOption,
            ignoreBrowserslistConfig,
            configPath,
            debug,
            shouldInjectPolyfill,
            absoluteImports
        } = options;
        const providerOptions = this.objectWithoutPropertiesLoose(options, ["method", "targets", "ignoreBrowserslistConfig", "configPath", "debug", "shouldInjectPolyfill", "absoluteImports"]);

        if (this.isEmpty(options)) {
            throw new Error(`This plugin requires options. See more options at https://github.com/babel/babel-polyfills/blob/main/docs/usage.md`);
        }

        let methodName: string;
        if (method === "usage-global") methodName = "usageGlobal";
        else if (method === "entry-global") methodName = "entryGlobal";
        else if (method === "usage-pure") methodName = "usagePure";
        else if (typeof method !== "string") {
            throw new Error(".method must be a string");
        } else {
            throw new Error(`.method must be one of "entry-global", "usage-global" or "usage-pure" (received ${JSON.stringify(method)})`);
        }

        let targets;
        if (targetsOption || configPath || ignoreBrowserslistConfig) {
            const targetsObj = typeof targetsOption === "string" || Array.isArray(targetsOption) ? { browsers: targetsOption } : targetsOption;
            targets = this.getTargets(targetsObj, { ignoreBrowserslistConfig, configPath });
        } else {
            targets = babelApi.targets();
        }

        return {
            method,
            methodName,
            targets,
            absoluteImports: absoluteImports != null ? absoluteImports : false,
            shouldInjectPolyfill,
            debug: !!debug,
            providerOptions
        };
    }

    private objectWithoutPropertiesLoose(source: any, excluded: string[]) {
        if (source == null) return {};
        let target: any = {};
        let sourceKeys = Object.keys(source);
        let key: string, i: number;

        for (i = 0; i < sourceKeys.length; i++) {
            key = sourceKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            target[key] = source[key];
        }
        return target;
    }

    private isEmpty(obj: any): boolean {
        return Object.keys(obj).length === 0;
    }

    // Additional methods and logic would be implemented here
}

export default PolyfillService;