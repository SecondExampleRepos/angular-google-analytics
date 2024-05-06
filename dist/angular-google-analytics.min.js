/**
 * Angular Google Analytics - Easy tracking for your AngularJS application
 * @version v1.1.8 - 2016-12-30
 * @link http://github.com/revolunet/angular-google-analytics
 * @author Julien Bouquillon <julien@revolunet.com> (https://github.com/revolunet)
 * @contributors Julien Bouquillon (https://github.com/revolunet),Justin Saunders (https://github.com/justinsa),Chris Esplin (https://github.com/deltaepsilon),Adam Misiorny (https://github.com/adam187)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function(a: any, b: any): void {
    "use strict";
    if (typeof module !== 'undefined' && module.exports) {
        b(typeof angular === 'undefined' ? require('angular') : angular);
        module.exports = "angular-google-analytics";
    } else if (typeof define === 'function' && define.amd) {
        define(["angular"], b);
    } else {
        b(a.angular);
    }
})(this, function(a: angular.IModule, b?: any): angular.IModule {
    "use strict";
    return a.module("angular-google-analytics", []).provider("Analytics", function(): void {
        type AccountInfo = { tracker: string; trackEvent: boolean };
        type CookieConfig = string | { cookieDomain: string };
        type TrackerConfig = {
            tracker: string;
            fields: any;
            crossDomainLinker: boolean;
            crossLinkDomains?: string[];
            displayFeatures?: boolean;
            enhancedLinkAttribution?: boolean;
            set?: any;
            trackEcommerce?: boolean;
            trackEvent?: boolean;
        };

        let accounts: AccountInfo[] | null = null,
            domainName: string | undefined,
            experimentId: string | undefined,
            currency: string = "USD",
            removeRegExp: RegExp | undefined,
            pageEvent: string = "$routeChangeSuccess",
            cookieConfig: CookieConfig = "auto",
            useAnalytics: boolean = true,
            useDisplayFeatures: boolean = false,
            useEnhancedLinkAttribution: boolean = false,
            useCrossDomainLinker: boolean = false,
            trackUrlParams: boolean = false,
            disableAnalytics: boolean = false,
            hybridMobileSupport: boolean = false,
            ignoreFirstPageLoad: boolean = false,
            logAllCalls: boolean = false,
            testMode: boolean = false,
            debugMode: boolean = false,
            traceDebuggingMode: boolean = false,
            trackRoutes: boolean = true,
            delayScriptTag: boolean = false;

        this.setAccount = function(account: string | AccountInfo | AccountInfo[]): void {
            accounts = angular.isUndefined(account) || account === false ? null :
                angular.isArray(account) ? account as AccountInfo[] :
                angular.isObject(account) ? [account as AccountInfo] :
                [{ tracker: account as string, trackEvent: true }];
        };

        this.trackPages = function(enable: boolean): void {
            trackRoutes = !!enable;
        };

        this.setDomainName = function(name: string): void {
            domainName = name;
        };

        this.useDisplayFeatures = function(enable: boolean): void {
            useDisplayFeatures = !!enable;
        };

        this.useAnalytics = function(enable: boolean): void {
            useAnalytics = !!enable;
        };

        this.useEnhancedLinkAttribution = function(enable: boolean): void {
            useEnhancedLinkAttribution = !!enable;
        };

        this.useCrossDomainLinker = function(enable: boolean): void {
            useCrossDomainLinker = !!enable;
        };

        this.setPageEvent = function(event: string): void {
            pageEvent = event;
        };

        this.setCookieConfig = function(config: CookieConfig): void {
            cookieConfig = config;
        };

        this.useECommerce = function(useEcommerce: boolean, enhancedEcommerce: boolean): void {
            this.trackEcommerce = !!useEcommerce;
            this.trackEvent = !!enhancedEcommerce;
        };

        this.setCurrency = function(curr: string): void {
            currency = curr;
        };

        this.setRemoveRegExp = function(regExp: RegExp): void {
            if (regExp instanceof RegExp) {
                removeRegExp = regExp;
            }
        };

        this.setExperimentId = function(id: string): void {
            experimentId = id;
        };

        this.ignoreFirstPageLoad = function(ignore: boolean): void {
            ignoreFirstPageLoad = !!ignore;
        };

        this.trackUrlParams = function(enable: boolean): void {
            trackUrlParams = !!enable;
        };

        this.disableAnalytics = function(disable: boolean): void {
            disableAnalytics = !!disable;
        };

        this.setHybridMobileSupport = function(enable: boolean): void {
            hybridMobileSupport = !!enable;
        };

        this.startOffline = function(start: boolean): void {
            if (start) {
                this.delayScriptTag(true);
            }
        };

        this.delayScriptTag = function(delay: boolean): void {
            delayScriptTag = !!delay;
        };

        this.logAllCalls = function(log: boolean): void {
            logAllCalls = !!log;
        };

        this.enterTestMode = function(): void {
            testMode = true;
        };

        this.enterDebugMode = function(debug: boolean): void {
            debugMode = true;
            traceDebuggingMode = !!debug;
        };

        this.readFromRoute = function(read: boolean): void {
            trackRoutes = !!read;
        };

        this.$get = ["$document", "$location", "$log", "$rootScope", "$window", "$injector",
            function(E: angular.IDocumentService, F: angular.ILocationService, G: angular.ILogService, H: angular.IRootScopeService, I: Window, J: angular.auto.IInjectorService): any {
                let createScriptTag = function(): void {
                    // Implementation for creating script tags
                };

                let registerTrackers = function(): void {
                    // Implementation for registering trackers
                };

                return {
                    log: [],
                    offlineQueue: [],
                    configuration: {
                        accounts: accounts,
                        universalAnalytics: useAnalytics,
                        crossDomainLinker: useCrossDomainLinker,
                        crossLinkDomains: domainName,
                        currency: currency,
                        debugMode: debugMode,
                        delayScriptTag: delayScriptTag,
                        disableAnalytics: disableAnalytics,
                        displayFeatures: useDisplayFeatures,
                        domainName: domainName,
                        ecommerce: this.trackEcommerce,
                        enhancedEcommerce: this.trackEvent,
                        enhancedLinkAttribution: useEnhancedLinkAttribution,
                        experimentId: experimentId,
                        hybridMobileSupport: hybridMobileSupport,
                        ignoreFirstPageLoad: ignoreFirstPageLoad,
                        logAllCalls: logAllCalls,
                        pageEvent: pageEvent,
                        readFromRoute: trackRoutes,
                        removeRegExp: removeRegExp,
                        testMode: testMode,
                        traceDebuggingMode: traceDebuggingMode,
                        trackPrefix: "",
                        trackRoutes: trackRoutes,
                        trackUrlParams: trackUrlParams
                    },
                    getUrl: function(): string {
                        return F.absUrl();
                    },
                    setCookieConfig: function(config: CookieConfig): void {
                        cookieConfig = config;
                    },
                    getCookieConfig: function(): CookieConfig {
                        return cookieConfig;
                    },
                    createAnalyticsScriptTag: createScriptTag,
                    createScriptTag: createScriptTag,
                    registerScriptTags: createScriptTag,
                    registerTrackers: registerTrackers,
                    offline: function(offline: boolean): void {
                        // Implementation for offline handling
                    },
                    trackPage: function(url: string, title: string, options: any): void {
                        // Implementation for page tracking
                    },
                    trackEvent: function(category: string, action: string, label: string, value: number, nonInteraction: boolean, options: any): void {
                        // Implementation for event tracking
                    },
                    addTrans: function(id: string, affiliation: string, revenue: string, shipping: string, tax: string, currency: string): void {
                        // Implementation for transaction addition
                    },
                    addItem: function(id: string, name: string, sku: string, category: string, price: string, quantity: number): void {
                        // Implementation for item addition
                    },
                    trackTrans: function(): void {
                        // Implementation for transaction tracking
                    },
                    clearTrans: function(): void {
                        // Implementation for clearing transactions
                    },
                    addProduct: function(id: string, name: string, category: string, brand: string, variant: string, price: string, quantity: number, coupon: string, position: number, customDimensions: any): void {
                        // Implementation for product addition
                    },
                    addPromo: function(id: string, name: string, creative: string, position: string): void {
                        // Implementation for promo addition
                    },
                    addImpression: function(id: string, name: string, list: string, brand: string, category: string, variant: string, position: number, price: string): void {
                        // Implementation for impression addition
                    },
                    productClick: function(id: string): void {
                        // Implementation for product click tracking
                    },
                    promoClick: function(id: string): void {
                        // Implementation for promo click tracking
                    },
                    trackDetail: function(): void {
                        // Implementation for detail tracking
                    },
                    trackCart: function(action: string, list: string): void {
                        // Implementation for cart tracking
                    },
                    trackCheckout: function(step: number, option: string): void {
                        // Implementation for checkout tracking
                    },
                    trackTimings: function(category: string, variable: string, time: number, label: string): void {
                        // Implementation for timing tracking
                    },
                    trackTransaction: function(id: string, affiliation: string, revenue: string, tax: string, shipping: string, coupon: string, list: string, step: number, option: string): void {
                        // Implementation for transaction tracking
                    },
                    trackException: function(description: string, fatal: boolean): void {
                        // Implementation for exception tracking
                    },
                    setAction: function(action: string, properties: any): void {
                        // Implementation for setting action
                    },
                    pageView: function(): void {
                        // Implementation for page view
                    },
                    send: function(): void {
                        // Implementation for sending data
                    },
                    set: function(property: string, value: any, trackerName?: string): void {
                        // Implementation for setting properties
                    }
                };
            }
        ];
    }).directive("gaTrackEvent", ["Analytics", "$parse", function(a: any, b: angular.IParseService): angular.IDirective {
        return {
            restrict: "A",
            link: function(c: angular.IScope, d: JQLite, e: angular.IAttributes): void {
                let eventHandler = b(e.gaTrackEvent);
                d.bind("click", function(): void {
                    if (!e.gaTrackEventIf || c.$eval(e.gaTrackEventIf)) {
                        if (eventHandler.length > 1) {
                            a.trackEvent.apply(a, eventHandler(c));
                        }
                    }
                });
            }
        };
    }]);
});