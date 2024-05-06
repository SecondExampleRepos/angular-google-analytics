 
/**
 * Angular Google Analytics - Easy tracking for your AngularJS application
 * @version v1.1.8 - 2016-12-30
 * @link http://github.com/revolunet/angular-google-analytics
 * @author Julien Bouquillon <julien@revolunet.com> (https://github.com/revolunet)
 * @contributors Julien Bouquillon (https://github.com/revolunet),Justin Saunders (https://github.com/justinsa),Chris Esplin (https://github.com/deltaepsilon),Adam Misiorny (https://github.com/adam187)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
/* globals define */
(function (root: any, factory: Function) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) {
    if (typeof angular === 'undefined') {
      factory(require('angular'));
    } else {
      factory(angular);
    }
    module.exports = 'angular-google-analytics';
  } else if (typeof define === 'function' && define.amd) {
    define(['angular'], factory);
  } else {
    factory(root.angular);
  }
}(this, function (angular: angular.IAngularStatic, undefined) {
  'use strict';
  angular.module('angular-google-analytics', [])
    .provider('Analytics', function () {
      let accounts: any,
          analyticsJS: boolean = true,
          cookieConfig: string = 'auto', // DEPRECATED
          created: boolean = false,
          crossDomainLinker: boolean = false,
          crossLinkDomains: any,
          currency: string = 'USD',
          debugMode: boolean = false,
          delayScriptTag: boolean = false,
          displayFeatures: boolean = false,
          disableAnalytics: boolean = false,
          domainName: string,
          ecommerce: boolean = false,
          enhancedEcommerce: boolean = false,
          enhancedLinkAttribution: boolean = false,
          experimentId: string,
          ignoreFirstPageLoad: boolean = false,
          logAllCalls: boolean = false,
          hybridMobileSupport: boolean = false,
          offlineMode: boolean = false,
          pageEvent: string = '$routeChangeSuccess',
          readFromRoute: boolean = false,
          removeRegExp: RegExp,
          testMode: boolean = false,
          traceDebuggingMode: boolean = false,
          trackPrefix: string = '',
          trackRoutes: boolean = true,
          trackUrlParams: boolean = false;

      this.log = [];
      this.offlineQueue = [];

      /**
       * Configuration Methods
       **/

      this.setAccount = function (tracker: any) {
        if (angular.isUndefined(tracker) || tracker === false) {
          accounts = undefined;
        } else if (angular.isArray(tracker)) {
          accounts = tracker;
        } else if (angular.isObject(tracker)) {
          accounts = [tracker];
        } else {
          // In order to preserve an existing behavior with how the _trackEvent function works,
          // the trackEvent property must be set to true when there is only a single tracker.
          accounts = [{ tracker: tracker, trackEvent: true }];
        }
        return this;
      };

      this.trackPages = function (val: boolean) {
        trackRoutes = !!val;
        return this;
      };

      this.trackPrefix = function (prefix: string) {
        trackPrefix = prefix;
        return this;
      };

      this.setDomainName = function (domain: string) {
        domainName = domain;
        return this;
      };

      this.useDisplayFeatures = function (val: boolean) {
        displayFeatures = !!val;
        return this;
      };

      this.useAnalytics = function (val: boolean) {
        analyticsJS = !!val;
        return this;
      };

      this.useEnhancedLinkAttribution = function (val: boolean) {
        enhancedLinkAttribution = !!val;
        return this;
      };

      this.useCrossDomainLinker = function (val: boolean) {
        crossDomainLinker = !!val;
        return this;
      };

      this.setCrossLinkDomains = function (domains: any) {
        crossLinkDomains = domains;
        return this;
      };

      this.setPageEvent = function (name: string) {
        pageEvent = name;
        return this;
      };

      /* DEPRECATED */
      this.setCookieConfig = function (config: string) {
        cookieConfig = config;
        return this;
      };

      this.useECommerce = function (val: boolean, enhanced: boolean) {
        ecommerce = !!val;
        enhancedEcommerce = !!enhanced;
        return this;
      };

      this.setCurrency = function (currencyCode: string) {
        currency = currencyCode;
        return this;
      };

      this.setRemoveRegExp = function (regex: RegExp) {
        if (regex instanceof RegExp) {
          removeRegExp = regex;
        }
        return this;
      };

      this.setExperimentId = function (id: string) {
        experimentId = id;
        return this;
      };

      this.ignoreFirstPageLoad = function (val: boolean) {
        ignoreFirstPageLoad = !!val;
        return this;
      };

      this.trackUrlParams = function (val: boolean) {
        trackUrlParams = !!val;
        return this;
      };

      this.disableAnalytics = function (val: boolean) {
        disableAnalytics = !!val;
        return this;
      };

      this.setHybridMobileSupport = function (val: boolean) {
        hybridMobileSupport = !!val;
        return this;
      };

      this.startOffline = function (val: boolean) {
        offlineMode = !!val;
        if (offlineMode === true) {
          this.delayScriptTag(true);
        }
        return this;
      };

      this.delayScriptTag = function (val: boolean) {
        delayScriptTag = !!val;
        return this;
      };

      this.logAllCalls = function (val: boolean) {
        logAllCalls = !!val;
        return this;
      };

      this.enterTestMode = function () {
        testMode = true;
        return this;
      };

      this.enterDebugMode = function (enableTraceDebugging: boolean) {
        debugMode = true;
        traceDebuggingMode = !!enableTraceDebugging;
        return this;
      };
      
      // Enable reading page url from route object
      this.readFromRoute = function(val: boolean) {
        readFromRoute = !!val;
        return this;
      };

      /**
       * Public Service
       */
      this.$get = ['$document', // To read page title 
                   '$location', //
                   '$log',      //
                   '$rootScope',//
                   '$window',   //
                   '$injector', // To access ngRoute module without declaring a fixed dependency
                   function ($document: angular.IDocumentService, $location: angular.ILocationService, $log: angular.ILogService, $rootScope: angular.IRootScopeService, $window: angular.IWindowService, $injector: angular.auto.IInjectorService) {
        var that = this;

        /**
         * Side-effect Free Helper Methods
         **/

        var isPropertyDefined = function (key: string, config: any) {
          return angular.isObject(config) && angular.isDefined(config[key]);
        };

        var isPropertySetTo = function (key: string, config: any, value: any) {
          return isPropertyDefined(key, config) && config[key] === value;
        };

        var generateCommandName = function (commandName: string, config: any) {
          if (angular.isString(config)) {
            return config + '.' + commandName;
          }
          return isPropertyDefined('name', config) ? (config.name + '.' + commandName) : commandName;
        };
        
        // Try to read route configuration and log warning if not possible
        var $route: any = {};
        if (readFromRoute) {
          if (!$injector.has('$route')) {
            $log.warn('$route service is not available. Make sure you have included ng-route in your application dependencies.');
          } else {
            $route = $injector.get('$route');
          }
        }

        // Get url for current page 
        var getUrl = function () {
          // Using ngRoute provided tracking urls
          if (readFromRoute && $route.current && ('pageTrack' in $route.current)) {
            return $route.current.pageTrack;
          }
           
          // Otherwise go the old way
          var url = trackUrlParams ? $location.url() : $location.path(); 
          return removeRegExp ? url.replace(removeRegExp, '') : url;
        };

        var getUtmParams = function () {
          var utmToCampaignVar = {
            utm_source: 'campaignSource',
            utm_medium: 'campaignMedium',
            utm_term: 'campaignTerm',
            utm_content: 'campaignContent',
            utm_campaign: 'campaignName'
          };
          var object: any = {};

          angular.forEach($location.search(), function (value: any, key: string) {
            var campaignVar = utmToCampaignVar[key];

            if (angular.isDefined(campaignVar)) {
              object[campaignVar] = value;
            }
          });

          return object;
        };

        /**
         * get ActionFieldObject
         * https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#action-data
         * @param id
         * @param affliation
         * @param revenue
         * @param tax
         * @param shipping
         * @param coupon
         * @param list
         * @param step
         * @param option
         */
        var getActionFieldObject = function (id: string, affiliation: string, revenue: string, tax: string, shipping: string, coupon: string, list: string, step: string, option: string) {
          var obj: any = {};
          if (id) { obj.id = id; }
          if (affiliation) { obj.affiliation = affiliation; }
          if (revenue) { obj.revenue = revenue; }
          if (tax) { obj.tax = tax; }
          if (shipping) { obj.shipping = shipping; }
          if (coupon) { obj.coupon = coupon; }
          if (list) { obj.list = list; }
          if (step) { obj.step = step; }
          if (option) { obj.option = option; }
          return obj;
        };

        /**
         * Private Methods
         */

        var _getProtocol = function (httpPostfix: string, httpsPostfix: string) {
          var protocol = '',
              isSslEnabled = document.location.protocol === 'https:',
              isChromeExtension = document.location.protocol === 'chrome-extension:',
              isHybridApplication = analyticsJS === true && hybridMobileSupport === true;
          httpPostfix = angular.isString(httpPostfix) ? httpPostfix : '';
          httpsPostfix = angular.isString(httpsPostfix) ? httpsPostfix : '';
          if (httpPostfix !== '') {
            protocol = 'http:' + httpPostfix;
          }
          if (isChromeExtension || isHybridApplication || (isSslEnabled && httpsPostfix !== '')) {
            protocol = 'https:' + httpsPostfix;
          }
          return protocol;
        };

        var _gaJs = function (fn: Function) {
          if (!analyticsJS && $window._gaq && typeof fn === 'function') {
            fn();
          }
        };

        var _gaq = function () {
          var args = Array.prototype.slice.call(arguments);
          if (offlineMode === true) {
            that.offlineQueue.push([_gaq, args]);
            return;
          }
          if (!$window._gaq) {
            $window._gaq = [];
          }
          if (logAllCalls === true) {
            that._log.apply(that, args);
          }
          $window._gaq.push(args);
        };

        var _analyticsJs = function (fn: Function) {
          if (analyticsJS && $window.ga && typeof fn === 'function') {
            fn();
          }
        };

        var _ga = function () {
          var args = Array.prototype.slice.call(arguments);
          if (offlineMode === true) {
            that.offlineQueue.push([_ga, args]);
            return;
          }
          if (typeof $window.ga !== 'function') {
            that._log('warn', 'ga function not set on window');
            return;
          }
          if (logAllCalls === true) {
            that._log.apply(that, args);
          }
          $window.ga.apply(null, args);
        };

        var _gaMultipleTrackers = function (includeFn: Function) {
          // Drop the includeFn from the arguments and preserve the original command name
          var args = Array.prototype.slice.call(arguments, 1),
              commandName = args[0],
              trackers = [];
          if (typeof includeFn === 'function') {
            accounts.forEach(function (account: any) {
              if (includeFn(account)) {
                trackers.push(account);
              }
            });
          } else {
            // No include function indicates that all accounts are to be used
            trackers = accounts;
          }

          // To preserve backwards compatibility fallback to _ga method if no account
          // matches the specified includeFn. This preserves existing behaviors by
          // performing the single tracker operation.
          if (trackers.length === 0) {
            _ga.apply(that, args);
            return;
          }

          trackers.forEach(function (tracker: any) {
            // Check tracker 'select' function, if it exists, for whether the tracker should be used with the current command.
            // If the 'select' function returns false then the tracker will not be used with the current command.
            if (isPropertyDefined('select', tracker) && typeof tracker.select === 'function' && !tracker.select(args)) {
              return;
            }
            args[0] = generateCommandName(commandName, tracker);
            _ga.apply(that, args);
          });
        };

        this._log = function () {
          var args = Array.prototype.slice.call(arguments);
          if (args.length > 0) {
            if (args.length > 1) {
              switch (args[0]) {
                case 'debug':
                case 'error':
                case 'info':
                case 'log':
                case 'warn':
                  $log[args[0]](args.slice(1));
                  break;
              }
            }
            that.log.push(args);
          }
        };

        /* DEPRECATED */
        this._createScriptTag = function () {
          that._registerScriptTags();
          that._registerTrackers();
        };

        /* DEPRECATED */
        this._createAnalyticsScriptTag = function () {
          that._registerScriptTags();
          that._registerTrackers();
        };

        this._registerScriptTags = function () {
          var document = $document[