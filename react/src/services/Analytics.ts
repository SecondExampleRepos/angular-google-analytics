import { useEffect, useState, useCallback } from 'react';
import { useRootScope } from '../hooks/useRootScope';

interface AnalyticsConfig {
  accounts?: any[];
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
  const { state: rootScopeState, updateState: updateRootScopeState, events: rootScopeEvents } = useRootScope();
  const [config, setConfig] = useState<AnalyticsConfig>({});
  const [log, setLog] = useState<any[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [offlineMode, setOfflineMode] = useState(false);
  const [created, setCreated] = useState(false);

  const isFunction = (fn: any) => typeof fn === 'function';

  const isPropertyDefined = (key: string, config: any) => config && config[key] !== undefined;

  const isPropertySetTo = (key: string, config: any, value: any) => isPropertyDefined(key, config) && config[key] === value;

  const generateCommandName = (commandName: string, config: any) => {
    if (typeof config === 'string') {
      return `${config}.${commandName}`;
    }
    return isPropertyDefined('name', config) ? `${config.name}.${commandName}` : commandName;
  };

  const getUrl = () => {
    if (config.readFromRoute && rootScopeState.$route && rootScopeState.$route.current && rootScopeState.$route.current.pageTrack) {
      return rootScopeState.$route.current.pageTrack;
    }
    const url = config.trackUrlParams ? window.location.href : window.location.pathname;
    return config.removeRegExp ? url.replace(config.removeRegExp, '') : url;
import { useLocation } from 'react-router-dom';

const getUtmParams = () => {
  const location = useLocation();
  const utmToCampaignVar = {
    utm_source: 'campaignSource',
    utm_medium: 'campaignMedium',
    utm_term: 'campaignTerm',
    utm_content: 'campaignContent',
    utm_campaign: 'campaignName'
  };
  const params = new URLSearchParams(location.search);
  const object: any = {};

  params.forEach((value, key) => {
    const campaignVar = utmToCampaignVar[key];
    if (campaignVar) {
      object[campaignVar] = value;
    }
  });

  return object;
};
  };

  const getUtmParams = () => {
    const location = useLocation();
    const utmToCampaignVar = {
      utm_source: 'campaignSource',
      utm_medium: 'campaignMedium',
      utm_term: 'campaignTerm',
      utm_content: 'campaignContent',
      utm_campaign: 'campaignName'
    };
    const params = new URLSearchParams(location.search);
    const object: any = {};

    params.forEach((value, key) => {
      const campaignVar = utmToCampaignVar[key];
      if (campaignVar) {
        object[campaignVar] = value;
      }
    });

    return object;
    return {};
  };

  const getActionFieldObject = (id: string, affiliation: string, revenue: string, tax: string, shipping: string, coupon: string, list: string, step: string, option: string) => {
    const obj: any = {};
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

  const _getProtocol = (httpPostfix: string, httpsPostfix: string) => {
    const protocol = '';
    const isSslEnabled = document.location.protocol === 'https:';
    const isChromeExtension = document.location.protocol === 'chrome-extension:';
    const isHybridApplication = config.universalAnalytics === true && config.hybridMobileSupport === true;
    httpPostfix = typeof httpPostfix === 'string' ? httpPostfix : '';
    httpsPostfix = typeof httpsPostfix === 'string' ? httpsPostfix : '';
    if (httpPostfix !== '') {
      return `http:${httpPostfix}`;
    }
    if (isChromeExtension || isHybridApplication || (isSslEnabled && httpsPostfix !== '')) {
      return `https:${httpsPostfix}`;
    }
    return protocol;
  };

  const _gaJs = (fn: Function) => {
    if (!config.universalAnalytics && window._gaq && isFunction(fn)) {
      fn();
    }
  };

  const _gaq = (...args: any[]) => {
    if (offlineMode) {
      setOfflineQueue([...offlineQueue, [_gaq, args]]);
      return;
    }
    if (!window._gaq) {
      window._gaq = [];
    }
    if (config.logAllCalls) {
      _log(...args);
    }
    window._gaq.push(args);
  };

  const _analyticsJs = (fn: Function) => {
    if (config.universalAnalytics && window.ga && isFunction(fn)) {
      fn();
    }
  };

  const _ga = (...args: any[]) => {
    if (offlineMode) {
      setOfflineQueue([...offlineQueue, [_ga, args]]);
      return;
    }
    if (!isFunction(window.ga)) {
      _log('warn', 'ga function not set on window');
      return;
    }
    if (config.logAllCalls) {
      _log(...args);
    }
    window.ga(...args);
  };

  const _gaMultipleTrackers = (includeFn: Function, ...args: any[]) => {
    const commandName = args[0];
    let trackers = [];
    if (isFunction(includeFn)) {
      config.accounts.forEach((account: any) => {
        if (includeFn(account)) {
          trackers.push(account);
        }
      });
    } else {
      trackers = config.accounts;
    }

    if (trackers.length === 0) {
      _ga(...args);
      return;
    }

    trackers.forEach((tracker: any) => {
      if (isPropertyDefined('select', tracker) && isFunction(tracker.select) && !tracker.select(args)) {
        return;
      }
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

  const _registerScriptTags = () => {
    const document = window.document;
    const protocol = _getProtocol();
    let scriptSource;

    if (created) {
      _log('warn', 'Script tags already created');
      return false;
    }

    if (config.disableAnalytics) {
      config.accounts.forEach((trackerObj: any) => {
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
          }, i[r].l = 1 * new Date();
          a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
          a.async = 1;
          a.src = g;
          m.parentNode.insertBefore(a, m);
        })(window, document, 'script', scriptSource, 'ga');
      } else {
        if (!isFunction(window.ga)) {
          window.ga = function () { };
        }
        _log('inject', scriptSource);
      }

      if (config.traceDebuggingMode) {
        window.ga_debug = { trace: true };
      }

      if (config.experimentId) {
        const expScript = document.createElement('script');
        const s = document.getElementsByTagName('script')[0];
        expScript.src = `${protocol}//www.google-analytics.com/cx/api.js?experiment=${config.experimentId}`;
        s.parentNode.insertBefore(expScript, s);
      }
    } else {
      scriptSource = _getProtocol('//www', '//ssl') + '.google-analytics.com/ga.js';
      if (config.displayFeatures) {
        scriptSource = `${protocol}//stats.g.doubleclick.net/dc.js`;
      }

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

    setCreated(true);
    return true;
  };

  const _registerTrackers = () => {
    if (!config.accounts || config.accounts.length < 1) {
      _log('warn', 'No accounts to register');
      return false;
    }

    if (config.universalAnalytics) {
      config.accounts.forEach((trackerObj: any) => {
        trackerObj.crossDomainLinker = isPropertyDefined('crossDomainLinker', trackerObj) ? trackerObj.crossDomainLinker : config.crossDomainLinker;
        trackerObj.crossLinkDomains = isPropertyDefined('crossLinkDomains', trackerObj) ? trackerObj.crossLinkDomains : config.crossLinkDomains;
        trackerObj.displayFeatures = isPropertyDefined('displayFeatures', trackerObj) ? trackerObj.displayFeatures : config.displayFeatures;
        trackerObj.enhancedLinkAttribution = isPropertyDefined('enhancedLinkAttribution', trackerObj) ? trackerObj.enhancedLinkAttribution : config.enhancedLinkAttribution;
        trackerObj.set = isPropertyDefined('set', trackerObj) ? trackerObj.set : {};
        trackerObj.trackEcommerce = isPropertyDefined('trackEcommerce', trackerObj) ? trackerObj.trackEcommerce : config.ecommerce;
        trackerObj.trackEvent = isPropertyDefined('trackEvent', trackerObj) ? trackerObj.trackEvent : false;

        const fields: any = {};
        if (isPropertyDefined('fields', trackerObj)) {
          fields = trackerObj.fields;
        }
        if (trackerObj.crossDomainLinker) {
          fields.allowLinker = true;
        }
        if (isPropertyDefined('name', trackerObj)) {
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
        _log('warn', 'Multiple trackers are not supported with ga.js. Using first tracker only');
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
        _log('warn', `${command} is not available when Enhanced Ecommerce is enabled with analytics.js`);
      } else {
        _log('warn', `Ecommerce must be enabled to use ${command} with analytics.js`);
      }
    }
    return result;
  };

  const _enhancedEcommerceEnabled = (warn: boolean, command: string) => {
    const result = config.ecommerce && config.enhancedEcommerce;
    if (warn && !result) {
      _log('warn', `Enhanced Ecommerce must be enabled to use ${command} with analytics.js`);
    }
    return result;
  };

  const _trackPage = (url: string, title: string, custom: any) => {
    title = title || document.title;
    _gaJs(() => {
      _gaq('_set', 'title', title);
      _gaq('_trackPageview', _getTrackPrefixUrl(url));
    });
    _analyticsJs(() => {
      const opt_fieldObject: any = {
        page: _getTrackPrefixUrl(url),
        title: title,
      };
      Object.assign(opt_fieldObject, getUtmParams());
      if (custom) {
        Object.assign(opt_fieldObject, custom);
      }
      _gaMultipleTrackers(undefined, 'send', 'pageview', opt_fieldObject);
    });
  };

  const _trackEvent = (category: string, action: string, label: string, value: any, noninteraction: boolean, custom: any) => {
    _gaJs(() => {
      _gaq('_trackEvent', category, action, label, value, !!noninteraction);
    });
    _analyticsJs(() => {
      const opt_fieldObject: any = {};
      const includeFn = (trackerObj: any) => isPropertySetTo('trackEvent', trackerObj, true);

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
        const includeFn = (trackerObj: any) => isPropertySetTo('trackEcommerce', trackerObj, true);

        _gaMultipleTrackers(
          includeFn,
          'ecommerce:addTransaction',
          {
            id: transactionId,
            affiliation: affiliation,
            revenue: total,
            tax: tax,
            shipping: shipping,
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
        const includeFn = (trackerObj: any) => isPropertySetTo('trackEcommerce', trackerObj, true);

        _gaMultipleTrackers(
          includeFn,
          'ecommerce:addItem',
          {
            id: transactionId,
            name: name,
            sku: sku,
            category: category,
            price: price,
            quantity: quantity,
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
        const includeFn = (trackerObj: any) => isPropertySetTo('trackEcommerce', trackerObj, true);

        _gaMultipleTrackers(includeFn, 'ecommerce:send');
      }
    });
  };

  const _clearTrans = () => {
    _analyticsJs(() => {
      if (_ecommerceEnabled(true, 'clearTrans')) {
        const includeFn = (trackerObj: any) => isPropertySetTo('trackEcommerce', trackerObj, true);

        _gaMultipleTrackers(includeFn, 'ecommerce:clear');
      }
    });
  };

  const _addProduct = (productId: string, name: string, category: string, brand: string, variant: string, price: string, quantity: string, coupon: string, position: string, custom: any) => {
    _gaJs(() => {
      _gaq('_addProduct', productId, name, category, brand, variant, price, quantity, coupon, position);
    });
    _analyticsJs(() => {
      if (_enhancedEcommerceEnabled(true, 'addProduct')) {
        const includeFn = (trackerObj: any) => isPropertySetTo('trackEcommerce', trackerObj, true);
        const details: any = {
          id: productId,
          name: name,
          category: category,
          brand: brand,
          variant: variant,
          price: price,
          quantity: quantity,
          coupon: coupon,
          position: position,
        };
        if (        if (custom) {
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
        const includeFn = (trackerObj: any) => isPropertySetTo('trackEcommerce', trackerObj, true);

        _gaMultipleTrackers(
          includeFn,
          'ec:addImpression',
          {
            id: id,
            name: name,
            category: category,
            brand: brand,
            variant: variant,
            list: list,
            position: position,
            price: price,
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
        const includeFn = (trackerObj: any) => isPropertySetTo('trackEcommerce', trackerObj, true);

        _gaMultipleTrackers(
          includeFn,
          'ec:addPromo',
          {
            id: productId,
            name: name,
            creative: creative,
            position: position,
          }
        );
      }
    });
  };

  const _setAction = (action: string, obj: any) => {
    _gaJs(() => {
      _gaq('_setAction', action, obj);
    });
    _analyticsJs(() => {
      if (_enhancedEcommerceEnabled(true, 'setAction')) {
        const includeFn = (trackerObj: any) => isPropertySetTo('trackEcommerce', trackerObj, true);

        _gaMultipleTrackers(includeFn, 'ec:setAction', action, obj);
      }
    });
  };

  const _trackTransaction = (transactionId: string, affiliation: string, revenue: string, tax: string, shipping: string, coupon: string, list: string, step: string, option: string) => {
    _setAction('purchase', getActionFieldObject(transactionId, affiliation, revenue, tax, shipping, coupon, list, step, option));
  };

  const _trackRefund = (transactionId: string) => {
    _setAction('refund', getActionFieldObject(transactionId));
  };

  const _trackCheckOut = (step: string, option: string) => {
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
          if (config.readFromRoute) {
            const currentRoute = rootScopeState.currentRoute;
            if (!currentRoute || !currentRoute.templateUrl || currentRoute.doNotTrack) {
              return;
            }
          }
      _ga(generateCommandName('set', trackerName), name, value);
    });
  };

  const _trackTimings = (timingCategory: string, timingVar: string, timingValue: number, timingLabel?: string) => {
    _analyticsJs(() => {
      _gaMultipleTrackers(undefined, 'send', 'timing', timingCategory, timingVar, timingValue, timingLabel);
          const currentRoute = rootScopeState.$route?.current;
          if (!currentRoute || !currentRoute.templateUrl || currentRoute.doNotTrack) {
            return;
          }
  };

  const _trackException = (description: string, isFatal: boolean) => {
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
      rootScopeEvents.onPageEvent = () => {
        if (config.readFromRoute) {
          const currentRoute = rootScopeState.$route?.current;
          if (!currentRoute || !currentRoute.templateUrl || currentRoute.doNotTrack) {
            return;
          }
        }
        _trackPage();
      };
    }
  }, [config]);

  return {
    log,
    offlineQueue,
    configuration: config,
    getUrl,
    registerScriptTags: _registerScriptTags,
    registerTrackers: _registerTrackers,
    offline: (mode: boolean) => {
      if (mode && !offlineMode) {
        setOfflineMode(true);
      }
      if (!mode && offlineMode) {
        setOfflineMode(false);
        while (offlineQueue.length > 0) {
          const [fn, args] = offlineQueue.shift();
          fn(...args);
        }
      }
      return offlineMode;
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