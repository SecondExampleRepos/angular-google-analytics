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
  const [log, setLog] = useState<any[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const { someState, setSomeState, someFunction } = useRootScope();

  useEffect(() => {
    // Initialization logic
    const initialize = () => {
      setSomeState('initialized');
    };
    initialize();
  }, [setSomeState]);

  const isFunction = (fn: any): boolean => typeof fn === 'function';

  const isPropertyDefined = (key: string, config: any): boolean =>
    typeof config === 'object' && config !== null && key in config;

  const isPropertySetTo = (key: string, config: any, value: any): boolean =>
    isPropertyDefined(key, config) && config[key] === value;

  const generateCommandName = (commandName: string, config: any): string =>
    typeof config === 'string' ? `${config}.${commandName}` : isPropertyDefined('name', config) ? `${config.name}.${commandName}` : commandName;

  const getUrl = (): string => {
    // SECOND AGENT: [MISSING CONTEXT] - Implement URL retrieval logic
    return '';
  };

  const getUtmParams = (): Record<string, any> => {
    // SECOND AGENT: [MISSING CONTEXT] - Implement UTM parameter retrieval logic
    return {};
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
  ): Record<string, any> => {
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

  const _getTrackPrefixUrl = (url?: string): string => config.trackPrefix + (url ? url : getUrl());

  const _getProtocol = (httpPostfix?: string, httpsPostfix?: string): string => {
    const protocol = document.location.protocol;
    const isSslEnabled = protocol === 'https:';
    const isChromeExtension = protocol === 'chrome-extension:';
    const isHybridApplication = config.universalAnalytics && config.hybridMobileSupport;
    if (httpPostfix) return `http:${httpPostfix}`;
    if (isChromeExtension || isHybridApplication || (isSslEnabled && httpsPostfix)) return `https:${httpsPostfix}`;
    return '';
  };

  const _gaJs = (fn: () => void) => {
    if (!config.universalAnalytics && window._gaq && isFunction(fn)) fn();
  };

  const _gaq = (...args: any[]) => {
    if (config.offlineMode) {
      setOfflineQueue([...offlineQueue, [_gaq, args]]);
      return;
    }
    if (!window._gaq) window._gaq = [];
    if (config.logAllCalls) _log(...args);
    window._gaq.push(args);
  };

  const _analyticsJs = (fn: () => void) => {
    if (config.universalAnalytics && window.ga && isFunction(fn)) fn();
  };

  const _ga = (...args: any[]) => {
    if (config.offlineMode) {
      setOfflineQueue([...offlineQueue, [_ga, args]]);
      return;
    }
    if (!isFunction(window.ga)) {
      _log('warn', 'ga function not set on window');
      return;
    }
    if (config.logAllCalls) _log(...args);
    window.ga(...args);
  };

  const _gaMultipleTrackers = (includeFn: (tracker: Tracker) => boolean, ...args: any[]) => {
    const commandName = args[0];
    const trackers = config.accounts?.filter(includeFn) || [];
    if (trackers.length === 0) {
      _ga(...args);
      return;
    }
    trackers.forEach((tracker) => {
      if (isPropertyDefined('select', tracker) && isFunction(tracker.select) && !tracker.select(args)) return;
      args[0] = generateCommandName(commandName, tracker);
      _ga(...args);
    });
  };

  const _log = (...args: any[]) => {
    if (args.length > 0) {
      if (args.length > 1) {
        switch (args[0]) {
          case 'debug':
          case 'error':
          case 'info':
          case 'log':
          case 'warn':
            console[args[0]](args.slice(1));
            break;
        }
      }
      setLog([...log, args]);
    }
  };

  const _registerScriptTags = (): boolean => {
    const document = window.document;
    const protocol = _getProtocol();
    let scriptSource: string;

    if (config.created) {
      _log('warn', 'Script tags already created');
      return false;
    }

    if (config.disableAnalytics) {
      config.accounts?.forEach((trackerObj) => {
        _log('info', `Analytics disabled: ${trackerObj.tracker}`);
        window[`ga-disable-${trackerObj.tracker}`] = true;
      });
    }

    if (config.universalAnalytics) {
      scriptSource = `${protocol}//www.google-analytics.com/${config.debugMode ? 'analytics_debug.js' : 'analytics.js'}`;
      if (!config.testMode) {
        (function (i, s, o, g, r, a, m) {
          i['GoogleAnalyticsObject'] = r;
          i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments);
          };
          i[r].l = 1 * new Date();
          a = s.createElement(o);
          m = s.getElementsByTagName(o)[0];
          a.async = 1;
          a.src = g;
          m.parentNode.insertBefore(a, m);
        })(window, document, 'script', scriptSource, 'ga');
      } else {
        if (!isFunction(window.ga)) window.ga = () => {};
        _log('inject', scriptSource);
      }

      if (config.traceDebuggingMode) window.ga_debug = { trace: true };

      if (config.experimentId) {
        const expScript = document.createElement('script');
        const s = document.getElementsByTagName('script')[0];
        expScript.src = `${protocol}//www.google-analytics.com/cx/api.js?experiment=${config.experimentId}`;
        s.parentNode.insertBefore(expScript, s);
      }
    } else {
      scriptSource = _getProtocol('//www', '//ssl') + '.google-analytics.com/ga.js';
      if (config.displayFeatures) scriptSource = `${protocol}//stats.g.doubleclick.net/dc.js`;

      if (!config.testMode) {
        (function () {
          const ga = document.createElement('script');
          ga.type = 'text/javascript';
          ga.async = true;
          ga.src = scriptSource;
          const s = document.getElementsByTagName('script')[0];
          s.parentNode.insertBefore(ga, s);
        })();
      } else {
        _log('inject', scriptSource);
      }
    }

    setConfig({ ...config, created: true });
    return true;
  };

  const _registerTrackers = (): boolean => {
    if (!config.accounts || config.accounts.length < 1) {
      _log('warn', 'No accounts to register');
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
        if (trackerObj.crossDomainLinker) fields.allowLinker = true;
        if (isPropertyDefined('name', trackerObj)) fields.name = trackerObj.name;
        trackerObj.fields = fields;

        _ga('create', trackerObj.tracker, trackerObj.fields);

        if (config.hybridMobileSupport) _ga(generateCommandName('set', trackerObj), 'checkProtocolTask', null);

        for (const key in trackerObj.set) {
          if (trackerObj.set.hasOwnProperty(key)) _ga(generateCommandName('set', trackerObj), key, trackerObj.set[key]);
        }

        if (trackerObj.crossDomainLinker) {
          _ga(generateCommandName('require', trackerObj), 'linker');
          if (trackerObj.crossLinkDomains) _ga(generateCommandName('linker:autoLink', trackerObj), trackerObj.crossLinkDomains);
        }

        if (trackerObj.displayFeatures) _ga(generateCommandName('require', trackerObj), 'displayfeatures');

        if (trackerObj.trackEcommerce) {
          if (!config.enhancedEcommerce) {
            _ga(generateCommandName('require', trackerObj), 'ecommerce');
          } else {
            _ga(generateCommandName('require', trackerObj), 'ec');
            _ga(generateCommandName('set', trackerObj), '&cu', config.currency);
          }
        }

        if (trackerObj.enhancedLinkAttribution) _ga(generateCommandName('require', trackerObj), 'linkid');

        if (config.trackRoutes && !config.ignoreFirstPageLoad) _ga(generateCommandName('send', trackerObj), 'pageview', _getTrackPrefixUrl());
      });
    } else {
      if (config.accounts.length > 1) {
        _log('warn', 'Multiple trackers are not supported with ga.js. Using first tracker only');
        config.accounts = config.accounts.slice(0, 1);
      }

      _gaq('_setAccount', config.accounts[0].tracker);
      if (config.domainName) _gaq('_setDomainName', config.domainName);
      if (config.enhancedLinkAttribution) _gaq('_require', 'inpage_linkid', '//www.google-analytics.com/plugins/ga/inpage_linkid.js');
      if (config.trackRoutes && !config.ignoreFirstPageLoad) {
        if (config.removeRegExp) _gaq('_trackPageview', getUrl());
        else _gaq('_trackPageview');
      }
    }

    return true;
  };

  const _ecommerceEnabled = (warn: boolean, command: string): boolean => {
    const result = config.ecommerce && !config.enhancedEcommerce;
    if (warn && !result) {
      if (config.ecommerce && config.enhancedEcommerce) _log('warn', `${command} is not available when Enhanced Ecommerce is enabled with analytics.js`);
      else _log('warn', `Ecommerce must be enabled to use ${command} with analytics.js`);
    }
    return result;
  };

  const _enhancedEcommerceEnabled = (warn: boolean, command: string): boolean => {
    const result = config.ecommerce && config.enhancedEcommerce;
    if (warn && !result) _log('warn', `Enhanced Ecommerce must be enabled to use ${command} with analytics.js`);
    return result;
  };

  const _trackPage = (url?: string, title?: string, custom?: Record<string, any>) => {
    title = title || document.title;
    _gaJs(() => {
      _gaq('_set', 'title', title);
      _gaq('_trackPageview', _getTrackPrefixUrl(url));
    });
    _analyticsJs(() => {
      const opt_fieldObject: Record<string, any> = { page: _getTrackPrefixUrl(url), title };
      Object.assign(opt_fieldObject, getUtmParams(), custom);
      _gaMultipleTrackers(undefined, 'send', 'pageview', opt_fieldObject);
    });
  };

  const _trackEvent = (category: string, action: string, label?: string, value?: number, noninteraction?: boolean, custom?: Record<string, any>) => {
    _gaJs(() => _gaq('_trackEvent', category, action, label, value, !!noninteraction));
    _analyticsJs(() => {
      const opt_fieldObject: Record<string, any> = { nonInteraction: !!noninteraction, page: _getTrackPrefixUrl() };
      Object.assign(opt_fieldObject, custom);
      _gaMultipleTrackers((trackerObj) => isPropertySetTo('trackEvent', trackerObj, true), 'send', 'event', category, action, label, value, opt_fieldObject);
    });
  };

  const _addTrans = (transactionId: string, affiliation: string, total: string, tax: string, shipping: string, city: string, state: string, country: string, currency?: string) => {
    _gaJs(() => _gaq('_addTrans', transactionId, affiliation, total, tax, shipping, city, state, country));
    _analyticsJs(() => {
      if (_ecommerceEnabled(true, 'addTrans')) {
        _gaMultipleTrackers(
          (trackerObj) => isPropertySetTo('trackEcommerce', trackerObj, true),
          'ecommerce:addTransaction',
          { id: transactionId, affiliation, revenue: total, tax, shipping, currency: currency || 'USD' }
        );
      }
    });
  };

  const _addItem = (transactionId: string, sku: string, name: string, category: string, price: string, quantity: string) => {
    _gaJs(() => _gaq('_addItem', transactionId, sku, name, category, price, quantity));
    _analyticsJs(() => {
      if (_ecommerceEnabled(true, 'addItem')) {
        _gaMultipleTrackers(
          (trackerObj) => isPropertySetTo('trackEcommerce', trackerObj, true),
          'ecommerce:addItem',
          { id: transactionId, name, sku, category, price, quantity }
        );
      }
    });
  };

  const _trackTrans = () => {
    _gaJs(() => _gaq('_trackTrans'));
    _analyticsJs(() => {
      if (_ecommerceEnabled(true, 'trackTrans')) _gaMultipleTrackers((trackerObj) => isPropertySetTo('trackEcommerce', trackerObj, true), 'ecommerce:send');
    });
  };

  const _clearTrans = () => {
    _analyticsJs(() => {
      if (_ecommerceEnabled(true, 'clearTrans')) _gaMultipleTrackers((trackerObj) => isPropertySetTo('trackEcommerce', trackerObj, true), 'ecommerce:clear');
    });
  };

  const _addProduct = (productId: string, name: string, category: string, brand: string, variant: string, price: string, quantity: string, coupon: string, position: string, custom?: Record<string, any>) => {
    _gaJs(() => _gaq('_addProduct', productId, name, category, brand, variant, price, quantity, coupon, position));
    _analyticsJs(() => {
      if (_enhancedEcommerceEnabled(true, 'addProduct')) {
        const details = { id: productId, name, category, brand, variant, price, quantity, coupon, position, ...custom };
        _gaMultipleTrackers((trackerObj) => isPropertySetTo('trackEcommerce', trackerObj, true), 'ec:addProduct', details);
      }
    });
  };

  const _addImpression = (id: string, name: string, list: string, brand: string, category: string, variant: string, position: string, price: string) => {
    _gaJs(() => _gaq('_addImpression', id, name, list, brand, category, variant, position, price));
    _analyticsJs(() => {
      if (_enhancedEcommerceEnabled(true, 'addImpression')) {
        _gaMultipleTrackers(
          (trackerObj) => isPropertySetTo('trackEcommerce', trackerObj, true),
          'ec:addImpression',
          { id, name, category, brand, variant, list, position, price }
        );
      }
    });
  };

  const _addPromo = (productId: string, name: string, creative: string, position: string) => {
    _gaJs(() => _gaq('_addPromo', productId, name, creative, position));
    _analyticsJs(() => {
      if (_enhancedEcommerceEnabled(true, 'addPromo')) {
        _gaMultipleTrackers(
          (trackerObj) => isPropertySetTo('trackEcommerce', trackerObj, true),
          'ec:addPromo',
      { id: productId, name, creative, position }
    );
  }
});

const _setAction = (action: string, obj: Record<string, any>) => {
  _gaJs(() => _gaq('_setAction', action, obj));
  _analyticsJs(() => {
    if (_enhancedEcommerceEnabled(true, 'setAction')) {
      _gaMultipleTrackers((trackerObj) => isPropertySetTo('trackEcommerce', trackerObj, true), 'ec:setAction', action, obj);
    }
  });
};

const _trackTransaction = (
  transactionId: string,
  affiliation: string,
  revenue: string,
  tax: string,
  shipping: string,
  coupon: string,
  list: string,
  step: number,
  option: string
) => {
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

const _trackCart = (action: string, listName: string) => {
  if (['add', 'remove'].includes(action)) {
    _setAction(action, { list: listName });
    _trackEvent('UX', 'click', `${action} ${action === 'add' ? 'to cart' : 'from cart'}`);
  }
};

const _promoClick = (promotionName: string) => {
  _setAction('promo_click');
  _trackEvent('Internal Promotions', 'click', promotionName);
};

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

const registerScriptTags = (): boolean => _registerScriptTags();
const registerTrackers = (): boolean => _registerTrackers();

const offline = (mode: boolean): boolean => {
  if (mode && !config.offlineMode) {
    setConfig({ ...config, offlineMode: true });
  } else if (!mode && config.offlineMode) {
    setConfig({ ...config, offlineMode: false });
    while (offlineQueue.length > 0) {
      const [fn, args] = offlineQueue.shift()!;
      fn(...args);
    }
  }
  return config.offlineMode!;
};

const trackPage = (url?: string, title?: string, custom?: Record<string, any>) => _trackPage(url, title, custom);
const trackEvent = (category: string, action: string, label?: string, value?: number, noninteraction?: boolean, custom?: Record<string, any>) => _trackEvent(category, action, label, value, noninteraction, custom);
const addTrans = (transactionId: string, affiliation: string, total: string, tax: string, shipping: string, city: string, state: string, country: string, currency?: string) => _addTrans(transactionId, affiliation, total, tax, shipping, city, state, country, currency);
const addItem = (transactionId: string, sku: string, name: string, category: string, price: string, quantity: string) => _addItem(transactionId, sku, name, category, price, quantity);
const trackTrans = () => _trackTrans();
const clearTrans = () => _clearTrans();
const addProduct = (productId: string, name: string, category: string, brand: string, variant: string, price: string, quantity: string, coupon: string, position: string, custom?: Record<string, any>) => _addProduct(productId, name, category, brand, variant, price, quantity, coupon, position, custom);
const addPromo = (productId: string, name: string, creative: string, position: string) => _addPromo(productId, name, creative, position);
const addImpression = (productId: string, name: string, list: string, brand: string, category: string, variant: string, position: string, price: string) => _addImpression(productId, name, list, brand, category, variant, position, price);
const productClick = (listName: string) => _productClick(listName);
const promoClick = (promotionName: string) => _promoClick(promotionName);
const trackDetail = () => _trackDetail();
const trackCart = (action: string, list: string) => _trackCart(action, list);
const trackCheckout = (step: number, option: string) => _trackCheckOut(step, option);
const trackTimings = (timingCategory: string, timingVar: string, timingValue: number, timingLabel?: string) => _trackTimings(timingCategory, timingVar, timingValue, timingLabel);
const trackTransaction = (transactionId: string, affiliation: string, revenue: string, tax: string, shipping: string, coupon: string, list: string, step: number, option: string) => _trackTransaction(transactionId, affiliation, revenue, tax, shipping, coupon, list, step, option);
const trackException = (description?: string, isFatal?: boolean) => _trackException(description, isFatal);
const setAction = (action: string, obj: Record<string, any>) => _setAction(action, obj);
const pageView = (trackerName?: string) => _pageView(trackerName);
const send = (...args: any[]) => _send(...args);
const set = (name: string, value: any, trackerName?: string) => _set(name, value, trackerName);

return {
  log,
  offlineQueue,
  configuration: config,
  getUrl,
  registerScriptTags,
  registerTrackers,
  offline,
  trackPage,
  trackEvent,
  addTrans,
  addItem,
  trackTrans,
  clearTrans,
  addProduct,
  addPromo,
  addImpression,
  productClick,
  promoClick,
  trackDetail,
  trackCart,
  trackCheckout,
  trackTimings,
  trackTransaction,
  trackException,
  setAction,
  pageView,
  send,
  set
};
};

export default useAnalytics;