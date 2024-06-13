import { useEffect, useState } from 'react';
import { useRootScope } from '../hooks/useRootScope';

interface Tracker {
  tracker: string;
  trackEvent?: boolean;
  crossDomainLinker?: boolean;
  crossLinkDomains?: string[];
  displayFeatures?: boolean;
  enhancedLinkAttribution?: boolean;
  set?: Record<string, any>;
  trackEcommerce?: boolean;
  fields?: Record<string, any>;
  name?: string;
  select?: (args: any[]) => boolean;
}

interface AnalyticsConfig {
  accounts?: Tracker[];
  universalAnalytics?: boolean;
  crossDomainLinker?: boolean;
  crossLinkDomains?: string[];
  currency?: string;
  debugMode?: boolean;
  delayScriptTag?: boolean;
  disableAnalytics?: boolean;
  displayFeatures?: boolean;
  domainName?: string;
  ecommerce?: boolean;
  enhancedEcommerce?: boolean;
  enhancedLinkAttribution?: boolean;
  experimentId?: string;
  hybridMobileSupport?: boolean;
  ignoreFirstPageLoad?: boolean;
  logAllCalls?: boolean;
  pageEvent?: string;
  readFromRoute?: boolean;
  removeRegExp?: RegExp;
  testMode?: boolean;
  traceDebuggingMode?: boolean;
  trackPrefix?: string;
  trackRoutes?: boolean;
  trackUrlParams?: boolean;
}

const useAnalytics = () => {
  const [config, setConfig] = useState<AnalyticsConfig>({});
  const { exampleState, updateExampleState } = useRootScope();

  const isFunction = (fn: any): fn is Function => typeof fn === 'function';

  const isPropertyDefined = (key: string, config: any) => {
    return typeof config === 'object' && config !== null && key in config;
  };

  const isPropertySetTo = (key: string, config: any, value: any) => {
    return isPropertyDefined(key, config) && config[key] === value;
  };

  const generateCommandName = (commandName: string, config: any) => {
    if (typeof config === 'string') {
      return `${config}.${commandName}`;
    }
    return isPropertyDefined('name', config) ? `${config.name}.${commandName}` : commandName;
  };

  const getUrl = () => {

    const url = config.trackUrlParams ? window.location.href : window.location.pathname;
    return config.removeRegExp ? url.replace(config.removeRegExp, '') : url;
  };

    const utmToCampaignVar: Record<string, string> = {
      utm_source: 'campaignSource',
      utm_medium: 'campaignMedium',
      utm_term: 'campaignTerm',
      utm_content: 'campaignContent',
      utm_campaign: 'campaignName',
    };
    const object: Record<string, any> = {};

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.forEach((value, key) => {
      const campaignVar = utmToCampaignVar[key];
      if (campaignVar) {
        object[campaignVar] = value;
      }
    });

    return object;
  };

  const getUtmParams = () => {

    const utmToCampaignVar: Record<string, string> = {
      utm_source: 'campaignSource',
      utm_medium: 'campaignMedium',
      utm_term: 'campaignTerm',
      utm_content: 'campaignContent',
      utm_campaign: 'campaignName',
    };
    const object: Record<string, any> = {};

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.forEach((value, key) => {
      const campaignVar = utmToCampaignVar[key];
      if (campaignVar) {
        object[campaignVar] = value;
      }
    });

    return object;
  };
  };

  const getActionFieldObject = (
    id?: string,
    affiliation?: string,
    revenue?: string,
    tax?: string,
    shipping?: string,
    coupon?: string,
    list?: string,
    step?: number,
    option?: string
  ) => {
    const obj: Record<string, any> = {};
    if (id) obj.id = id;
    if (affiliation) obj.affiliation = affiliation;
    if (revenue) obj.revenue = revenue;
    if (tax) obj.tax = tax;
    if (shipping) obj.shipping = shipping;
    if (coupon) obj.coupon = coupon;
    if (list) obj.list = list;
    if (step) obj.step = step;
    if (option) obj.option = option;
    return obj;
  };

  const _getTrackPrefixUrl = (url?: string) => {
    return config.trackPrefix + (url ? url : getUrl());
  };

  const _getProtocol = (httpPostfix?: string, httpsPostfix?: string) => {
    const protocol = '';

      config.offlineQueue.push([_gaq, args]);
      return;
    }
    const isChromeExtension = document.location.protocol === 'chrome-extension:';
    const isHybridApplication = config.universalAnalytics === true && config.hybridMobileSupport === true;
    httpPostfix = typeof httpPostfix === 'string' ? httpPostfix : '';

      console.log('GAQ Call:', args);
    }
    if (httpPostfix !== '') {
      return 'http:' + httpPostfix;
    }
    if (isChromeExtension || isHybridApplication || (isSslEnabled && httpsPostfix !== '')) {
      return 'https:' + httpsPostfix;
    }
    return protocol;
  };

      const offlineQueue = config.offlineQueue || [];
      offlineQueue.push([_gaq, args]);
      setConfig((prevConfig) => ({ ...prevConfig, offlineQueue }));
      return;
    }
  const _gaJs = (fn: Function) => {

      console.log('GAQ Call:', ...args);
    }
      const offlineQueue = config.offlineQueue || [];
      offlineQueue.push([_ga, args]);
      setConfig((prevConfig) => ({ ...prevConfig, offlineQueue }));

      console.warn('ga function not set on window');
      return;
    }

      console.log('GA call:', ...args);
    }

      const offlineQueue = config.offlineQueue || [];
      offlineQueue.push([_ga, args]);
      setConfig((prevConfig) => ({ ...prevConfig, offlineQueue }));

      console.warn('ga function not set on window');
      return;
    }

      console.log('GA call:', ...args);
    }
    }
  };

  const _gaq = (...args: any[]) => {
    if (config.offlineMode) {

      const offlineQueue = config.offlineQueue || [];
      offlineQueue.push([_gaq, args]);
      setConfig((prevConfig) => ({ ...prevConfig, offlineQueue }));
      return;
    }
      return;

      console.log('GAQ Call:', ...args);
    }
    if (!window._gaq) {
      window._gaq = [];
    }
    if (config.logAllCalls) {

      console.log('GAQ Call:', ...args);
    }
    }
    window._gaq.push(args);
  };

  const _analyticsJs = (fn: Function) => {

      const offlineQueue = config.offlineQueue || [];
      offlineQueue.push([_ga, args]);
      setConfig((prevConfig) => ({ ...prevConfig, offlineQueue }));

      console.warn('ga function not set on window');
      return;
    }

      console.log('GA call:', ...args);
    }
      fn();
    }
  };


      const offlineQueue = config.offlineQueue || [];
      offlineQueue.push([_ga, args]);
      setConfig((prevConfig) => ({ ...prevConfig, offlineQueue }));

      console.warn('ga function not set on window');
      return;
    }

      console.log('GA call:', ...args);
    }
    if (config.offlineMode) {

      const offlineQueue = config.offlineQueue || [];
      offlineQueue.push([_ga, args]);
      setConfig((prevConfig) => ({ ...prevConfig, offlineQueue }));

      console.warn('ga function not set on window');
      return;
    }

      console.log('GA call:', ...args);
    }
      return;
    }
    if (!isFunction(window.ga)) {
      // SECOND AGENT: [CODE NEEDS TO BE ADDED HERE LATER] - Implement logging logic
      return;
    }
    if (config.logAllCalls) {
      // SECOND AGENT: [CODE NEEDS TO BE ADDED HERE LATER] - Implement logging logic
    }

        console.info(`Analytics disabled: ${trackerObj.tracker}`);
  };


        if (config.logAllCalls) {
          console.info(`Analytics disabled: ${trackerObj.tracker}`);
        }
        window[`ga-disable-${trackerObj.tracker}`] = true;
      });
    const commandName = args[0];
    let trackers: Tracker[] = [];
    if (isFunction(includeFn)) {
      config.accounts?.forEach((account) => {
        if (includeFn(account)) {
          trackers.push(account);
        }
      });
    } else {
      trackers = config.accounts || [];
    }

    if (trackers.length === 0) {
      _ga(...args);
      return;
    }

    trackers.forEach((tracker) => {
        

        console.log('Test mode enabled, script source:', scriptSource);

        if (config.logAllCalls) {
          console.info(`Analytics disabled: ${trackerObj.tracker}`);
        }
        window[`ga-disable-${trackerObj.tracker}`] = true;
      });
        

        console.log('Injecting script:', scriptSource);
      }

        if (config.logAllCalls) {
          console.info(`Analytics disabled: ${trackerObj.tracker}`);
        }
        window[`ga-disable-${trackerObj.tracker}`] = true;
      _ga(...args);

        if (config.logAllCalls) {
          console.info(`Analytics disabled: ${trackerObj.tracker}`);
        }
        window[`ga-disable-${trackerObj.tracker}`] = true;
      });
  };

  const _registerScriptTags = () => {
    const document = window.document;
    const protocol = _getProtocol();
    let scriptSource;

    if (config.disableAnalytics) {
      config.accounts?.forEach((trackerObj) => {
        // SECOND AGENT: [CODE NEEDS TO BE ADDED HERE LATER] - Implement logging logic
        window[`ga-disable-${trackerObj.tracker}`] = true;
      });
    }

    if (config.universalAnalytics) {
      scriptSource = protocol + '//www.google-analytics.com/' + (config.debugMode ? 'analytics_debug.js' : 'analytics.js');
      if (!config.testMode) {
        (function (i, s, o, g, r, a, m) {
          i['GoogleAnalyticsObject'] = r;
          i[r] = i[r] || function () {
        

        if (config.logAllCalls) {
          console.log('GA call:', ...args);



        console.log('Script source for test mode:', scriptSource);
      }
      }
        

        if (config.logAllCalls) {
          console.log('GA call:', ...args);

        

        if (config.logAllCalls) {
          console.log('GA call:', ...args);

          a.async = 1;
          a.src = g;
          m.parentNode.insertBefore(a, m);

      console.warn('No accounts to register');
      return false;
    }

      console.warn('No accounts to register');
      return false;
    }
        if (!isFunction(window.ga)) {
          window.ga = function () { };
        }
        // SECOND AGENT: [CODE NEEDS TO BE ADDED HERE LATER] - Implement logging logic
      }

      

        console.log('Test mode enabled, script source:', scriptSource);
      }
        window.ga_debug = { trace: true };
      }

      if (config.experimentId) {
        const expScript = document.createElement('script');

      console.warn('No accounts to register');
      return false;

        console.log('Test mode enabled, script source:', scriptSource);
      }
        expScript.src = protocol + '//www.google-analytics.com/cx/api.js?experiment=' + config.experimentId;
        s.parentNode.insertBefore(expScript, s);
      }
    } else {
      scriptSource = _getProtocol('//www', '//ssl') + '.google-analytics.com/ga.js';
      if (config.displayFeatures) {

      console.warn('No accounts to register');
      return false;
    }

    if (config.universalAnalytics) {
      config.accounts.forEach((trackerObj) => {
        trackerObj.crossDomainLinker = isPropertyDefined('crossDomainLinker', trackerObj) ? trackerObj.crossDomainLinker : config.crossDomainLinker;
        trackerObj.crossLinkDomains = isPropertyDefined('crossLinkDomains', trackerObj) ? trackerObj.crossLinkDomains : config.crossLinkDomains;
        trackerObj.displayFeatures = isPropertyDefined('displayFeatures', trackerObj) ? trackerObj.displayFeatures : config.displayFeatures;
        trackerObj.enhancedLinkAttribution = isPropertyDefined('enhancedLinkAttribution', trackerObj) ? trackerObj.enhancedLinkAttribution : config.enhancedLinkAttribution;
        trackerObj.set = isPropertyDefined('set', trackerObj) ? trackerObj.set : {};
        trackerObj.trackEcommerce = isPropertyDefined('trackEcommerce', trackerObj) ? trackerObj.trackEcommerce : config.ecommerce;
        trackerObj.trackEvent = isPropertyDefined('trackEvent', trackerObj) ? trackerObj.trackEvent : false;

        const fields = trackerObj.fields || {};
        if (trackerObj.crossDomainLinker) {
          fields.allowLinker = true;
        }
        if (trackerObj.name) {
          fields.name = trackerObj.name;
        }
        trackerObj.fields = fields;

        _ga('create', trackerObj.tracker, trackerObj.fields);

        if (config.hybridMobileSupport) {
          _ga(generateCommandName('set', trackerObj), 'checkProtocolTask', null);
        }

        for (const key in trackerObj.set) {
          if (trackerObj.set.hasOwnProperty(key)) {
            _ga(generateCommandName('set', trackerObj), key, trackerObj.set[key]);
          }
        }

        if (trackerObj.crossDomainLinker) {
          _ga(generateCommandName('require', trackerObj), 'linker');
          if (trackerObj.crossLinkDomains) {
            _ga(generateCommandName('linker:autoLink', trackerObj), trackerObj.crossLinkDomains);
          }
        }

        if (trackerObj.displayFeatures) {
          _ga(generateCommandName('require', trackerObj), 'displayfeatures');
        }

        if (trackerObj.trackEcommerce) {
          if (!config.enhancedEcommerce) {
            _ga(generateCommandName('require', trackerObj), 'ecommerce');
          } else {
            _ga(generateCommandName('require', trackerObj), 'ec');
            _ga(generateCommandName('set', trackerObj), '&cu', config.currency);
          }
        }

        if (trackerObj.enhancedLinkAttribution) {
          _ga(generateCommandName('require', trackerObj), 'linkid');
        }

        if (config.trackRoutes && !config.ignoreFirstPageLoad) {
          _ga(generateCommandName('send', trackerObj), 'pageview', _getTrackPrefixUrl());
        }
      });
    } else {
      if (config.accounts.length > 1) {
        console.warn('Multiple trackers are not supported with ga.js. Using first tracker only');
        config.accounts = config.accounts.slice(0, 1);
      }

      _gaq('_setAccount', config.accounts[0].tracker);
      if (config.domainName) {
        _gaq('_setDomainName', config.domainName);
      }
      if (config.enhancedLinkAttribution) {
        _gaq('_require', 'inpage_linkid', '//www.google-analytics.com/plugins/ga/inpage_linkid.js');
      }
      if (config.trackRoutes && !config.ignoreFirstPageLoad) {
        if (config.removeRegExp) {
          _gaq('_trackPageview', getUrl());
        } else {
          _gaq('_trackPageview');
        }

        if (!isFunction(window.ga)) {
          // In test mode, create a ga function if none exists that is a noop sink.
          window.ga = function () {};
        }
        // Log script injection.
        console.log('Injecting script source for test mode:', scriptSource);
      }
    }

      console.warn('No accounts to register');
      return false;
    }

    if (config.universalAnalytics) {
      config.accounts.forEach((trackerObj) => {
        trackerObj.crossDomainLinker = isPropertyDefined('crossDomainLinker', trackerObj) ? trackerObj.crossDomainLinker : config.crossDomainLinker;
        trackerObj.crossLinkDomains = isPropertyDefined('crossLinkDomains', trackerObj) ? trackerObj.crossLinkDomains : config.crossLinkDomains;
        trackerObj.displayFeatures = isPropertyDefined('displayFeatures', trackerObj) ? trackerObj.displayFeatures : config.displayFeatures;
        trackerObj.enhancedLinkAttribution = isPropertyDefined('enhancedLinkAttribution', trackerObj) ? trackerObj.enhancedLinkAttribution : config.enhancedLinkAttribution;
        trackerObj.set = isPropertyDefined('set', trackerObj) ? trackerObj.set : {};
        trackerObj.trackEcommerce = isPropertyDefined('trackEcommerce', trackerObj) ? trackerObj.trackEcommerce : config.ecommerce;
        trackerObj.trackEvent = isPropertyDefined('trackEvent', trackerObj) ? trackerObj.trackEvent : false;

        const fields = trackerObj.fields || {};
        if (trackerObj.crossDomainLinker) {
          fields.allowLinker = true;
        }
        if (trackerObj.name) {
          fields.name = trackerObj.name;
        }
        trackerObj.fields = fields;

        _ga('create', trackerObj.tracker, trackerObj.fields);

        if (config.hybridMobileSupport) {
          _ga(generateCommandName('set', trackerObj), 'checkProtocolTask', null);
        }

        for (const key in trackerObj.set) {
          if (trackerObj.set.hasOwnProperty(key)) {
            _ga(generateCommandName('set', trackerObj), key, trackerObj.set[key]);
          }
        }

        if (trackerObj.crossDomainLinker) {
          _ga(generateCommandName('require', trackerObj), 'linker');
          if (trackerObj.crossLinkDomains) {
            _ga(generateCommandName('linker:autoLink', trackerObj), trackerObj.crossLinkDomains);
          }
        }

        if (trackerObj.displayFeatures) {
          _ga(generateCommandName('require', trackerObj), 'displayfeatures');
        }

        if (trackerObj.trackEcommerce) {
          if (!config.enhancedEcommerce) {
            _ga(generateCommandName('require', trackerObj), 'ecommerce');
          } else {
            _ga(generateCommandName('require', trackerObj), 'ec');
            _ga(generateCommandName('set', trackerObj), '&cu', config.currency);
          }
        }

        if (trackerObj.enhancedLinkAttribution) {
          _ga(generateCommandName('require', trackerObj), 'linkid');
        }

        if (config.trackRoutes && !config.ignoreFirstPageLoad) {
          _ga(generateCommandName('send', trackerObj), 'pageview', _getTrackPrefixUrl());
        }
      });
    } else {
      if (config.accounts.length > 1) {
        console.warn('Multiple trackers are not supported with ga.js. Using first tracker only');
        config.accounts = config.accounts.slice(0, 1);
      }

      _gaq('_setAccount', config.accounts[0].tracker);
      if (config.domainName) {
        _gaq('_setDomainName', config.domainName);
      }
      if (config.enhancedLinkAttribution) {
        _gaq('_require', 'inpage_linkid', '//www.google-analytics.com/plugins/ga/inpage_linkid.js');
      }
      if (config.trackRoutes && !config.ignoreFirstPageLoad) {
        if (config.removeRegExp) {
          _gaq('_trackPageview', getUrl());
        } else {
          _gaq('_trackPageview');
        }
      }
    }

    return true;
    return true;
      }

      if (!config.testMode) {
        (function () {
          const ga = document.createElement('script');
          ga.type = 'text/javascript';
          ga.async = true;
          ga.src = scriptSource;
          const s = document.getElementsByTagName('script')[0];

        console.warn('Multiple trackers are not supported with ga.js. Using first tracker only');
        config.accounts = config.accounts.slice(0, 1);
      }
        })();
      } else {
        // SECOND AGENT: [CODE NEEDS TO BE ADDED HERE LATER] - Implement logging logic
      }

        console.warn('Multiple trackers are not supported with ga.js. Using first tracker only');
        config.accounts = config.accounts.slice(0, 1);
      }

    return true;
  };

  const _registerTrackers = () => {
    if (!config.accounts || config.accounts.length < 1) {
      // SECOND AGENT: [CODE NEEDS TO BE ADDED HERE LATER] - Implement logging logic
      return false;
    }

    if (config.universalAnalytics) {
      config.accounts.forEach((trackerObj) => {
        trackerObj.crossDomainLinker = isPropertyDefined('crossDomainLinker', trackerObj) ? trackerObj.crossDomainLinker : config.crossDomainLinker;
        trackerObj.crossLinkDomains = isPropertyDefined('crossLinkDomains', trackerObj) ? trackerObj.crossLinkDomains : config.crossLinkDomains;
        trackerObj.displayFeatures = isPropertyDefined('displayFeatures', trackerObj) ? trackerObj.displayFeatures : config.displayFeatures;
        trackerObj.enhancedLinkAttribution = isPropertyDefined('enhancedLinkAttribution', trackerObj) ? trackerObj.enhancedLinkAttribution : config.enhancedLinkAttribution;
        trackerObj.set = isPropertyDefined('set', trackerObj) ? trackerObj.set : {};
        trackerObj.trackEcommerce = isPropertyDefined('trackEcommerce', trackerObj) ? trackerObj.trackEcommerce : config.ecommerce;

        console.warn(`${command} is not available when Enhanced Ecommerce is enabled with analytics.js`);
      504:         console.warn(`${command} is not available when Enhanced Ecommerce is enabled with analytics.js`);
      505:       } else {
      506:         console.warn(`Ecommerce must be enabled to use ${command} with analytics.js`);

        console.warn(`${command} is not available when Enhanced Ecommerce is enabled with analytics.js`);
        console.warn(`${command} is not available when Enhanced Ecommerce is enabled with analytics.js`);
        console.warn(`Ecommerce must be enabled to use ${command} with analytics.js`);
      }
        console.warn(`Ecommerce must be enabled to use ${command} with analytics.js`);
      }

        const fields = trackerObj.fields || {};
        if (trackerObj.crossDomainLinker) {


      console.warn(`Enhanced Ecommerce must be enabled to use ${command} with analytics.js`);
    }
    }
        }
        if (trackerObj.name) {
          fields.name = trackerObj.name;

        console.warn('Multiple trackers are not supported with ga.js. Using first tracker only');
        config.accounts = config.accounts.slice(0, 1);
      }
        trackerObj.fields = fields;


        console.warn('Multiple trackers are not supported with ga.js. Using first tracker only');
        config.accounts = config.accounts.slice(0, 1);
      }

        if (config.hybridMobileSupport) {
          _ga(generateCommandName('set', trackerObj), 'checkProtocolTask', null);
        }

        for (const key in trackerObj.set) {
          if (trackerObj.set.hasOwnProperty(key)) {
            _ga(generateCommandName('set', trackerObj), key, trackerObj.set[key]);
          }
        }

        if (trackerObj.crossDomainLinker) {
          _ga(generateCommandName('require', trackerObj), 'linker');
          if (trackerObj.crossLinkDomains) {
            _ga(generateCommandName('linker:autoLink', trackerObj), trackerObj.crossLinkDomains);
          }
        }

        if (trackerObj.displayFeatures) {
          _ga(generateCommandName('require', trackerObj), 'displayfeatures');

        console.warn(`${command} is not available when Enhanced Ecommerce is enabled with analytics.js`);

        console.warn('Multiple trackers are not supported with ga.js. Using first tracker only');
        config.accounts = config.accounts.slice(0, 1);
      }

        console.warn(`${command} is not available when Enhanced Ecommerce is enabled with analytics.js`);
      404:         console.warn(`Ecommerce must be enabled to use ${command} with analytics.js`);
        console.warn(`Ecommerce must be enabled to use ${command} with analytics.js`);
      }
      349:         console.warn(`Ecommerce must be enabled to use ${command} with analytics.js`);
        console.warn(`Ecommerce must be enabled to use ${command} with analytics.js`);

        if (trackerObj.trackEcommerce) {
          if (!config.enhancedEcommerce) {
            _ga(generateCommandName('require', trackerObj), 'ecommerce');

      console.warn('Enhanced Ecommerce must be enabled to use ' + command + ' with analytics.js');
    }

      console.warn(`${command} is not available when Enhanced Ecommerce is disabled.`);
    }
            _ga(generateCommandName('set', trackerObj), '&cu', config.currency);
          }
        }

        if (trackerObj.enhancedLinkAttribution) {
          _ga(generateCommandName('require', trackerObj), 'linkid');

        console.warn(`${command} is not available when Enhanced Ecommerce is enabled with analytics.js`);
      460:         console.warn(`${command} is not available when Enhanced Ecommerce is enabled with analytics.js`);
      461:       } else {
      462:         console.warn(`Ecommerce must be enabled to use ${command} with analytics.js`);
      463:       }
        console.warn(`Ecommerce must be enabled to use ${command} with analytics.js`);
      }

        if (config.trackRoutes && !config.ignoreFirstPageLoad) {
          _ga(generateCommandName('send', trackerObj), 'pageview', _getTrackPrefixUrl());

      console.warn('Enhanced Ecommerce must be enabled to use ' + command + ' with analytics.js');
    }
      });
    } else {
      if (config.accounts.length > 1) {
        // SECOND AGENT: [CODE NEEDS TO BE ADDED HERE LATER] - Implement logging logic
        config.accounts = config.accounts.slice(0, 1);
      }

      _gaq('_setAccount', config.accounts[0].tracker);
      if (config.domainName) {
        _gaq('_setDomainName', config.domainName);
      }
      if (config.enhancedLinkAttribution) {
        _gaq('_require', 'inpage_linkid', '//www.google-analytics.com/plugins/ga/inpage_linkid.js');
      }
      if (config.trackRoutes && !config.ignoreFirstPageLoad) {
        if (config.removeRegExp) {
          _gaq('_trackPageview', getUrl());
        } else {
          _gaq('_trackPageview');
        }
      }
    }

    return true;
  };

  const _ecommerceEnabled = (warn: boolean, command: string) => {
    const result = config.ecommerce && !config.enhancedEcommerce;
    if (warn && !result) {
      if (config.ecommerce && config.enhancedEcommerce) {
        // SECOND AGENT: [CODE NEEDS TO BE ADDED HERE LATER] - Implement logging logic
      } else {
        // SECOND AGENT: [CODE NEEDS TO BE ADDED HERE LATER] - Implement logging logic
      }
    }
    return result;
  };

  const _enhancedEcommerceEnabled = (warn: boolean, command: string) => {
    const result = config.ecommerce && config.enhancedEcommerce;
    if (warn && !result) {
      // SECOND AGENT: [CODE NEEDS TO BE ADDED HERE LATER] - Implement logging logic
    }
    return result;
  };

  const _trackPage = (url?: string, title?: string, custom?: Record<string, any>) => {
    title = title || document.title;
    _gaJs(() => {
      _gaq('_set', 'title', title);
      _gaq('_trackPageview', _getTrackPrefixUrl(url));
    });
    _analyticsJs(() => {
      const opt_fieldObject: Record<string, any> = {
        page: _getTrackPrefixUrl(url),
        title,
      };
      Object.assign(opt_fieldObject, getUtmParams());
      if (custom) {
        Object.assign(opt_fieldObject, custom);
      }
      _gaMultipleTrackers(undefined, 'send', 'pageview', opt_fieldObject);
    });
  };

  const _trackEvent = (category: string, action: string, label?: string, value?: number, noninteraction?: boolean, custom?: Record<string, any>) => {
    _gaJs(() => {
      _gaq('_trackEvent', category, action, label, value, !!noninteraction);
    });
    _analyticsJs(() => {
      const opt_fieldObject: Record<string, any> = {};
      const includeFn = (trackerObj: Tracker) => isPropertySetTo('trackEvent', trackerObj, true);

      if (noninteraction !== undefined) {
        opt_fieldObject.nonInteraction = !!noninteraction;
      }
      if (custom) {
        Object.assign(opt_fieldObject, custom);
      }
      if (!opt_fieldObject.page) {
        opt_fieldObject.page = _getTrackPrefixUrl();
      }
      _gaMultipleTrackers(includeFn, 'send', 'event', category, action, label, value, opt_fieldObject);
    });
  };

  const _addTrans = (transactionId: string, affiliation: string, total: string, tax: string, shipping: string, city: string, state: string, country: string, currency: string) => {
    _gaJs(() => {
      _gaq('_addTrans', transactionId, affiliation, total, tax, shipping, city, state, country);
    });
    _analyticsJs(() => {
      if (_ecommerceEnabled(true, 'addTrans')) {
        const includeFn = (trackerObj: Tracker) => isPropertySetTo('trackEcommerce', trackerObj, true);

        _gaMultipleTrackers(
          includeFn,
          'ecommerce:addTransaction',
          {
            id: transactionId,
            affiliation,
            revenue: total,
            tax,
            shipping,
            currency: currency || 'USD',
          }
        );
      }
    });
  };

  const _addItem = (transactionId: string, sku: string, name: string, category: string, price: string, quantity: string) => {
    _gaJs(() => {
      _gaq('_addItem', transactionId, sku, name, category, price, quantity);
    });
    _analyticsJs(() => {
      if (_ecommerceEnabled(true, 'addItem')) {
        const includeFn = (trackerObj: Tracker) => isPropertySetTo('trackEcommerce', trackerObj, true);

        _gaMultipleTrackers(
          includeFn,
          'ecommerce:addItem',
          {
            id: transactionId,
            name,
            sku,
            category,
            price,
            quantity,
          }
        );
      }
    });
  };

  const _trackTrans = () => {
    _gaJs(() => {
      _gaq('_trackTrans');
    });
    _analyticsJs(() => {
      if (_ecommerceEnabled(true, 'trackTrans')) {
        const includeFn = (trackerObj: Tracker) => isPropertySetTo('trackEcommerce', trackerObj, true);

        _gaMultipleTrackers(includeFn, 'ecommerce:send');
      }
    });
  };

  const _clearTrans = () => {
    _analyticsJs(() => {
      if (_ecommerceEnabled(true, 'clearTrans')) {
        const includeFn = (trackerObj: Tracker) => isPropertySetTo('trackEcommerce', trackerObj, true);

        _gaMultipleTrackers(includeFn, 'ecommerce:clear');
      }
    });
  };

  const _addProduct = (productId: string, name: string, category: string, brand: string, variant: string, price: string, quantity: string, coupon: string, position: string, custom?: Record<string, any>) => {
    _gaJs(() => {
      _gaq('_addProduct', productId, name, category, brand, variant, price, quantity, coupon, position);
    });
    _analyticsJs(() => {
      if (_enhancedEcommerceEnabled(true, 'addProduct')) {
        const includeFn = (trackerObj: Tracker) => isPropertySetTo('trackEcommerce', trackerObj, true);
        const details = {
          id: productId,
          name,
          category,
          brand,
          variant,
          price,
          quantity,
          coupon,
          position,
        };
        if (custom) {
          Object.assign(details, custom);
        }
        _gaMultipleTrackers(includeFn, 'ec:addProduct', details);
      }
    });
  };

  const _addImpression = (id: string, name: string, list: string, brand: string, category: string, variant: string, position: string, price: string) => {
    _gaJs(() => {
      _gaq('_addImpression', id, name, list, brand, category, variant, position, price);
    });
    _analyticsJs(() => {
      if (_enhancedEcommerceEnabled(true, 'addImpression')) {
        const includeFn = (trackerObj: Tracker) => isPropertySetTo('trackEcommerce', trackerObj, true);

        _gaMultipleTrackers(
          includeFn,
          'ec:addImpression',
          {
            id,
            name,
            category,
            brand,
            variant,
            list,
            position,
            price,
          }
        );
      }
    });
  };

  const _addPromo = (productId: string, name: string, creative: string, position: string) => {
    _gaJs(() => {
      _gaq('_addPromo', productId, name, creative, position);
    });
    _analyticsJs(() => {
      if (_enhancedEcommerceEnabled(true, 'addPromo')) {
        const includeFn = (trackerObj: Tracker) => isPropertySetTo('trackEcommerce', trackerObj, true);

        _gaMultipleTrackers(
          includeFn,
          'ec:addPromo',
          {
            id: productId,
            name,
            creative,
            position,
          }
        );
      }
    });
  };

  const _setAction = (action: string, obj: Record<string, any>) => {
    _gaJs(() => {
      _gaq('_setAction', action, obj);
    });
    _analyticsJs(() => {
      if (_enhancedEcommerceEnabled(true, 'setAction')) {
        const includeFn = (trackerObj: Tracker) => isPropertySetTo('trackEcommerce', trackerObj, true);

        _gaMultipleTrackers(includeFn, 'ec:setAction', action, obj);
      }
    });
  };

  const _trackTransaction = (transactionId: string, affiliation: string, revenue: string, tax: string, shipping: string, coupon: string, list: string, step: number, option: string) => {
    _setAction('purchase', getActionFieldObject(transactionId, affiliation, revenue, tax, shipping, coupon, list, step, option));
  };

  const _trackRefund = (transactionId: string) => {
    _setAction('refund', getActionFieldObject(transactionId));
  };

  const _trackCheckOut = (step: number, option: string) => {
    _setAction('checkout', getActionFieldObject(null, null, null, null, null, null, null, step, option));
  };

  const _trackDetail = () => {
    _setAction('detail');
    _pageView();
  };


      const handleRouteChange = () => {
        // Apply route-based filtering if configured
        if (config.readFromRoute) {
          // Avoid tracking undefined routes, routes without template (e.g., redirect routes)
          // and those explicitly marked as 'do not track'
          const currentRoute = window.location.pathname;
          if (!currentRoute || currentRoute.includes('doNotTrack')) {
            return;
          }
        }


      if (mode && !config.offlineMode) {
        // Switch to offline mode
        setConfig((prevConfig) => ({ ...prevConfig, offlineMode: true }));
      } else if (!mode && config.offlineMode) {
        // Switch to online mode and process the offline queue
        setConfig((prevConfig) => ({ ...prevConfig, offlineMode: false }));
        while (offlineQueue.length > 0) {
          const [fn, args] = offlineQueue.shift();
          fn(...args);
        }
      }
      return mode;
    },
      };

      // Listen to route changes
      window.addEventListener('popstate', handleRouteChange);

      // Cleanup event listener on component unmount

      const handleRouteChange = () => {
        // Apply route-based filtering if configured
        if (config.readFromRoute) {
          // Avoid tracking undefined routes, routes without template (e.g., redirect routes)
          // and those explicitly marked as 'do not track'
          const currentRoute = window.location.pathname;
          if (!currentRoute || currentRoute.includes('doNotTrack')) {

      const handleRouteChange = () => {
        // Apply route-based filtering if configured
        if (config.readFromRoute) {
          // Avoid tracking undefined routes, routes without template (e.g., redirect routes)
          // and those explicitly marked as 'do not track'
          const currentRoute = window.location.pathname;
          if (!currentRoute || currentRoute.includes('doNotTrack')) {
            return;
          }
        }
        _trackPage();

      if (mode && !config.offlineMode) {
        // Switch to offline mode
        setConfig((prevConfig) => ({ ...prevConfig, offlineMode: true }));
      } else if (!mode && config.offlineMode) {
        // Switch to online mode and process the offline queue
        setConfig((prevConfig) => ({ ...prevConfig, offlineMode: false }));
        const offlineQueue = config.offlineQueue || [];
        while (offlineQueue.length > 0) {
          const [fn, args] = offlineQueue.shift()!;
          fn(...args);
        }
      }
      return mode;
    },

      // Listen to route changes
      window.addEventListener('popstate', handleRouteChange);

      // Cleanup event listener on component unmount
      return () => {
        window.removeEventListener('popstate', handleRouteChange);

      const handleRouteChange = () => {
        // Apply route-based filtering if configured
        if (config.readFromRoute) {
          // Avoid tracking undefined routes, routes without template (e.g., redirect routes)
          // and those explicitly marked as 'do not track'
          const currentRoute = window.location.pathname;
          if (!currentRoute || currentRoute.includes('doNotTrack')) {
            return;
          }
        }
        _trackPage();

      if (mode && !config.offlineMode) {
        // Switch to offline mode
        setConfig((prevConfig) => ({ ...prevConfig, offlineMode: true }));
      } else if (!mode && config.offlineMode) {
        // Switch to online mode and process the offline queue
        setConfig((prevConfig) => ({ ...prevConfig, offlineMode: false }));
        const offlineQueue = config.offlineQueue || [];
        while (offlineQueue.length > 0) {
          const [fn, args] = offlineQueue.shift()!;
          fn(...args);
        }
      }
      return mode;
    },

      // Listen to route changes
      window.addEventListener('popstate', handleRouteChange);

      // Cleanup event listener on component unmount
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
    }
          }
        }
        _trackPage();

      if (mode && !config.offlineMode) {
        // Switch to offline mode
        setConfig((prevConfig) => ({ ...prevConfig, offlineMode: true }));
      } else if (!mode && config.offlineMode) {
        // Switch to online mode and process the offline queue
        setConfig((prevConfig) => ({ ...prevConfig, offlineMode: false }));
        const offlineQueue = config.offlineQueue || [];
        while (offlineQueue.length > 0) {
          const [fn, args] = offlineQueue.shift()!;
          fn(...args);
        }
      }
      return mode;
    },

      // Listen to route changes
      window.addEventListener('popstate', handleRouteChange);

      // Cleanup event listener on component unmount
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
    if (['add', 'remove'].includes(action)) {
      _setAction(action, { list: listName });
      _trackEvent('UX', 'click', `${action} ${action === 'add' ? 'to cart' : 'from cart'}`);
    }
  };

  const _promoClick = (promotionName: string) => {
    _setAction('promo_click');
    _trackEvent('Internal Promotions', 'click', promotionName);
  };

      const handleRouteChange = () => {
        // Apply route-based filtering if configured
        if (config.readFromRoute) {
          // Avoid tracking undefined routes, routes without template (e.g., redirect routes)
          // and those explicitly marked as 'do not track'
          const currentRoute = window.location.pathname;
          if (!currentRoute || currentRoute.includes('doNotTrack')) {
            return;
          }
        }
        _trackPage();

      if (mode && !config.offlineMode) {
        // Switch to offline mode
        setConfig((prevConfig) => ({ ...prevConfig, offlineMode: true }));
      } else if (!mode && config.offlineMode) {
        // Switch to online mode and process the offline queue
        setConfig((prevConfig) => ({ ...prevConfig, offlineMode: false }));
        const offlineQueue = config.offlineQueue || [];
        while (offlineQueue.length > 0) {
          const [fn, args] = offlineQueue.shift()!;
          fn(...args);
        }
      }
      return mode;
    },

      // Listen to route changes
      window.addEventListener('popstate', handleRouteChange);

      // Cleanup event listener on component unmount
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  const _productClick = (listName: string) => {
    _setAction('click', getActionFieldObject(null, null, null, null, null, null, listName, null, null));
    _trackEvent('UX', 'click', listName);
  };

  const _pageView = (trackerName?: string) => {
    _analyticsJs(() => {
      _ga(generateCommandName('send', trackerName), 'pageview');
    });
  };

  const _send = (...args: any[]) => {
    args.unshift('send');
    _analyticsJs(() => {
      _ga(...args);
    });
  };

  const _set = (name: string, value: any, trackerName?: string) => {
    _analyticsJs(() => {
      _ga(generateCommandName('set', trackerName), name, value);
    });
  };

  const _trackTimings = (timingCategory: string, timingVar: string, timingValue: number, timingLabel?: string) => {
    _analyticsJs(() => {
      _gaMultipleTrackers(undefined, 'send', 'timing', timingCategory, timingVar, timingValue, timingLabel);
    });
  };

  const _trackException = (description?: string, isFatal?: boolean) => {
    _analyticsJs(() => {
      _gaMultipleTrackers(undefined, 'send', 'exception', { exDescription: description, exFatal: !!isFatal });
    });
  };

  useEffect(() => {
    if (!config.delayScriptTag) {
      _registerScriptTags();
      _registerTrackers();
    }

    if (config.trackRoutes) {
      // SECOND AGENT: [CODE NEEDS TO BE ADDED HERE LATER] - Implement route tracking logic
    }
  }, [config]);

  return {
    log: [],
    offlineQueue: [],
    configuration: config,
    getUrl,
    registerScriptTags: _registerScriptTags,
    registerTrackers: _registerTrackers,
    offline: (mode: boolean) => {
      // SECOND AGENT: [CODE NEEDS TO BE ADDED HERE LATER] - Implement offline mode logic
      return mode;
    },
    trackPage: _trackPage,
    trackEvent: _trackEvent,
    addTrans: _addTrans,
    addItem: _addItem,
    trackTrans: _trackTrans,
    clearTrans: _clearTrans,
    addProduct: _addProduct,
    addPromo: _addPromo,
    addImpression: _addImpression,
    productClick: _productClick,
    promoClick: _promoClick,
    trackDetail: _trackDetail,
    trackCart: _trackCart,
    trackCheckout: _trackCheckOut,
    trackTimings: _trackTimings,
    trackTransaction: _trackTransaction,
    trackException: _trackException,
    setAction: _setAction,
    pageView: _pageView,
    send: _send,
    set: _set,
  };
};

export default useAnalytics;