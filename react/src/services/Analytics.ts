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
  const { someState, setSomeState, someFunction } = useRootScope();

  useEffect(() => {
    // Initialization logic here
    console.log('Initialization logic here');
    setSomeState('new value');
  }, []);

  const setAccount = (tracker: any) => {
    if (tracker === undefined || tracker === false) {
      setConfig((prevConfig) => ({ ...prevConfig, accounts: undefined }));
    } else if (Array.isArray(tracker)) {
      setConfig((prevConfig) => ({ ...prevConfig, accounts: tracker }));
    } else if (typeof tracker === 'object') {
      setConfig((prevConfig) => ({ ...prevConfig, accounts: [tracker] }));
    } else {
      setConfig((prevConfig) => ({
        ...prevConfig,
        accounts: [{ tracker: tracker, trackEvent: true }],
      }));
    }
  };

  const trackPages = (val: boolean) => {
    setConfig((prevConfig) => ({ ...prevConfig, trackRoutes: !!val }));
  };

  const trackPrefix = (prefix: string) => {
    setConfig((prevConfig) => ({ ...prevConfig, trackPrefix: prefix }));
  };

  const setDomainName = (domain: string) => {
    setConfig((prevConfig) => ({ ...prevConfig, domainName: domain }));
  };

  const useDisplayFeatures = (val: boolean) => {
    setConfig((prevConfig) => ({ ...prevConfig, displayFeatures: !!val }));
  };

  const useAnalytics = (val: boolean) => {
    setConfig((prevConfig) => ({ ...prevConfig, universalAnalytics: !!val }));
  };

  const useEnhancedLinkAttribution = (val: boolean) => {
    setConfig((prevConfig) => ({ ...prevConfig, enhancedLinkAttribution: !!val }));
  };

  const useCrossDomainLinker = (val: boolean) => {
    setConfig((prevConfig) => ({ ...prevConfig, crossDomainLinker: !!val }));
  };

  const setCrossLinkDomains = (domains: string[]) => {
    setConfig((prevConfig) => ({ ...prevConfig, crossLinkDomains: domains }));
  };

  const setPageEvent = (name: string) => {
    setConfig((prevConfig) => ({ ...prevConfig, pageEvent: name }));
  };

  const useECommerce = (val: boolean, enhanced: boolean) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      ecommerce: !!val,
      enhancedEcommerce: !!enhanced,
    }));
  };

  const setCurrency = (currencyCode: string) => {
    setConfig((prevConfig) => ({ ...prevConfig, currency: currencyCode }));
  };

  const setRemoveRegExp = (regex: RegExp) => {
    setConfig((prevConfig) => ({ ...prevConfig, removeRegExp: regex }));
  };

  const setExperimentId = (id: string) => {
    setConfig((prevConfig) => ({ ...prevConfig, experimentId: id }));
  };

  const ignoreFirstPageLoad = (val: boolean) => {
    setConfig((prevConfig) => ({ ...prevConfig, ignoreFirstPageLoad: !!val }));
  };

  const trackUrlParams = (val: boolean) => {
    setConfig((prevConfig) => ({ ...prevConfig, trackUrlParams: !!val }));
  };

  const disableAnalytics = (val: boolean) => {
    setConfig((prevConfig) => ({ ...prevConfig, disableAnalytics: !!val }));
  };

  const setHybridMobileSupport = (val: boolean) => {
    setConfig((prevConfig) => ({ ...prevConfig, hybridMobileSupport: !!val }));
  };

  const startOffline = (val: boolean) => {
    setConfig((prevConfig) => {
      if (val === true) {
        return { ...prevConfig, offlineMode: true, delayScriptTag: true };
      }
      return { ...prevConfig, offlineMode: false };
    });
  };

  const delayScriptTag = (val: boolean) => {
    setConfig((prevConfig) => ({ ...prevConfig, delayScriptTag: !!val }));
  };

  const logAllCalls = (val: boolean) => {
    setConfig((prevConfig) => ({ ...prevConfig, logAllCalls: !!val }));
  };

  const enterTestMode = () => {
    setConfig((prevConfig) => ({ ...prevConfig, testMode: true }));
  };

  const enterDebugMode = (enableTraceDebugging: boolean) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      debugMode: true,
      traceDebuggingMode: !!enableTraceDebugging,
    }));
  };

  const readFromRoute = (val: boolean) => {
    setConfig((prevConfig) => ({ ...prevConfig, readFromRoute: !!val }));
  };

  // Placeholder for other methods
  const getUrl = () => {
    // Assuming $location is replaced with window.location
    const url = config.trackUrlParams ? window.location.href : window.location.pathname;
    return config.removeRegExp ? url.replace(config.removeRegExp, '') : url;
  };

  const getUtmParams = () => {
    const utmToCampaignVar: Record<string, string> = {
      utm_source: 'campaignSource',
      utm_medium: 'campaignMedium',
      utm_term: 'campaignTerm',
      utm_content: 'campaignContent',
      utm_campaign: 'campaignName',
    };
    const params = new URLSearchParams(window.location.search);
    const object: Record<string, string> = {};

    params.forEach((value, key) => {
      const campaignVar = utmToCampaignVar[key];
      if (campaignVar) {
        object[campaignVar] = value;
      }
    });

    return object;
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

  const trackPage = (url?: string, title?: string, custom?: Record<string, any>) => {
    title = title || document.title;
    const opt_fieldObject: Record<string, any> = {
      page: url || getUrl(),
      title: title,
      ...getUtmParams(),
      ...custom,
    };
    // Assuming _ga is replaced with a function to send data to Google Analytics
    window.ga('send', 'pageview', opt_fieldObject);
  };

  const trackEvent = (
    category: string,
    action: string,
    label?: string,
    value?: number,
    noninteraction?: boolean,
    custom?: Record<string, any>
  ) => {
    const opt_fieldObject: Record<string, any> = {
      nonInteraction: noninteraction,
      ...custom,
    };
    // Assuming _ga is replaced with a function to send data to Google Analytics
    window.ga('send', 'event', category, action, label, value, opt_fieldObject);
  };

  const addTrans = (
    transactionId: string,
    affiliation: string,
    total: string,
    tax: string,
    shipping: string,
    city: string,
    state: string,
    country: string,
    currency: string = 'USD'
  ) => {
    // Assuming _ga is replaced with a function to send data to Google Analytics
    window.ga('ecommerce:addTransaction', {
      id: transactionId,
      affiliation: affiliation,
      revenue: total,
      tax: tax,
      shipping: shipping,
      currency: currency,
    });
  };

  const addItem = (
    transactionId: string,
    sku: string,
    name: string,
    category: string,
    price: string,
    quantity: string
  ) => {
    // Assuming _ga is replaced with a function to send data to Google Analytics
    window.ga('ecommerce:addItem', {
      id: transactionId,
      name: name,
      sku: sku,
      category: category,
      price: price,
      quantity: quantity,
    });
  };

  const trackTrans = () => {
    // Assuming _ga is replaced with a function to send data to Google Analytics
    window.ga('ecommerce:send');
  };

  const clearTrans = () => {
    // Assuming _ga is replaced with a function to send data to Google Analytics
    window.ga('ecommerce:clear');
  };

  const addProduct = (
    productId: string,
    name: string,
    category: string,
    brand: string,
    variant: string,
    price: string,
    quantity: string,
    coupon?: string,
    position?: number,
    custom?: Record<string, any>
  ) => {
    const details: Record<string, any> = {
      id: productId,
      name: name,
      category: category,
      brand: brand,
      variant: variant,
      price: price,
      quantity: quantity,
      coupon: coupon,
      position: position,
      ...custom,
    };
    // Assuming _ga is replaced with a function to send data to Google Analytics
    window.ga('ec:addProduct', details);
  };

  const addImpression = (
    id: string,
    name: string,
    list: string,
    brand: string,
    category: string,
    variant: string,
    position: number,
    price: string
  ) => {
    const details: Record<string, any> = {
      id: id,
      name: name,
      category: category,
      brand: brand,
      variant: variant,
      list: list,
      position: position,
      price: price,
    };
    // Assuming _ga is replaced with a function to send data to Google Analytics
    window.ga('ec:addImpression', details);
  };

  const addPromo = (
    productId: string,
    name: string,
    creative: string,
    position: string
  ) => {
    const details: Record<string, any> = {
      id: productId,
      name: name,
      creative: creative,
      position: position,
    };
    // Assuming _ga is replaced with a function to send data to Google Analytics
    window.ga('ec:addPromo', details);
  };

  const setAction = (action: string, obj: Record<string, any>) => {
    // Assuming _ga is replaced with a function to send data to Google Analytics
    window.ga('ec:setAction', action, obj);
  };

  const trackTransaction = (
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
    setAction('purchase', getActionFieldObject(transactionId, affiliation, revenue, tax, shipping, coupon, list, step, option));
  };

  const trackRefund = (transactionId: string) => {
    setAction('refund', getActionFieldObject(transactionId));
  };

  const trackCheckOut = (step: number, option: string) => {
    setAction('checkout', getActionFieldObject(null, null, null, null, null, null, null, step, option));
  };

  const trackDetail = () => {
    setAction('detail', {});
    trackPage();
  };

  const trackCart = (action: 'add' | 'remove', listName: string) => {
    if (['add', 'remove'].includes(action)) {
      setAction(action, { list: listName });
      trackEvent('UX', 'click', `${action} ${action === 'add' ? 'to cart' : 'from cart'}`);
    }
  };

  const promoClick = (promotionName: string) => {
    setAction('promo_click', {});
    trackEvent('Internal Promotions', 'click', promotionName);
  };

  const productClick = (listName: string) => {
    setAction('click', getActionFieldObject(null, null, null, null, null, null, listName, null, null));
    trackEvent('UX', 'click', listName);
  };

  const pageView = (trackerName?: string) => {
    // Assuming _ga is replaced with a function to send data to Google Analytics
    window.ga(trackerName ? `${trackerName}.send` : 'send', 'pageview');
  };

  const send = (...args: any[]) => {
    // Assuming _ga is replaced with a function to send data to Google Analytics
    window.ga('send', ...args);
  };

  const set = (name: string, value: any, trackerName?: string) => {
    // Assuming _ga is replaced with a function to send data to Google Analytics
    window.ga(trackerName ? `${trackerName}.set` : 'set', name, value);
  };

  const trackTimings = (
    timingCategory: string,
    timingVar: string,
    timingValue: number,
    timingLabel?: string
  ) => {
    // Assuming _ga is replaced with a function to send data to Google Analytics
    window.ga('send', 'timing', timingCategory, timingVar, timingValue, timingLabel);
  };

  const trackException = (description?: string, isFatal?: boolean) => {
    // Assuming _ga is replaced with a function to send data to Google Analytics
    window.ga('send', 'exception', { exDescription: description, exFatal: !!isFatal });
  };

  return {
    config,
    setAccount,
    trackPages,
    trackPrefix,
    setDomainName,
    useDisplayFeatures,
    useAnalytics,
    useEnhancedLinkAttribution,
    useCrossDomainLinker,
    setCrossLinkDomains,
    setPageEvent,
    useECommerce,
    setCurrency,
    setRemoveRegExp,
    setExperimentId,
    ignoreFirstPageLoad,
    trackUrlParams,
    disableAnalytics,
    setHybridMobileSupport,
    startOffline,
    delayScriptTag,
    logAllCalls,
    enterTestMode,
    enterDebugMode,
    readFromRoute,
    someState,
    setSomeState,
    someFunction,
  };
};

export default useAnalytics;