import { useEffect, useState } from 'react';

interface AnalyticsConfig {
  accounts?: any[];
  analyticsJS?: boolean;
  created?: boolean;
  crossDomainLinker?: boolean;
  crossLinkDomains?: string[];
  currency?: string;
  debugMode?: boolean;
  delayScriptTag?: boolean;
  displayFeatures?: boolean;
  disableAnalytics?: boolean;
  domainName?: string;
  ecommerce?: boolean;
  enhancedEcommerce?: boolean;
  enhancedLinkAttribution?: boolean;
  experimentId?: string;
  ignoreFirstPageLoad?: boolean;
  logAllCalls?: boolean;
  hybridMobileSupport?: boolean;
  offlineMode?: boolean;
  pageEvent?: string;
  readFromRoute?: boolean;
  removeRegExp?: RegExp;
  testMode?: boolean;
  traceDebuggingMode?: boolean;
  trackPrefix?: string;
  trackRoutes?: boolean;
  trackUrlParams?: boolean;
}

class AnalyticsService {
  private config: AnalyticsConfig;
  private log: any[] = [];
  private offlineQueue: any[] = [];

  constructor(config: AnalyticsConfig) {
    this.config = {
      accounts: [],
      analyticsJS: true,
      created: false,
      crossDomainLinker: false,
      crossLinkDomains: [],
      currency: 'USD',
      debugMode: false,
      delayScriptTag: false,
      displayFeatures: false,
      disableAnalytics: false,
      domainName: '',
      ecommerce: false,
      enhancedEcommerce: false,
      enhancedLinkAttribution: false,
      experimentId: '',
      ignoreFirstPageLoad: false,
      logAllCalls: false,
      hybridMobileSupport: false,
      offlineMode: false,
      pageEvent: '',
      readFromRoute: false,
      removeRegExp: undefined,
      testMode: false,
      traceDebuggingMode: false,
      trackPrefix: '',
      trackRoutes: true,
      trackUrlParams: false,
      ...config
    };
  }

  public setAccount(tracker: any) {
    if (!tracker) {
      this.config.accounts = undefined;
    } else if (Array.isArray(tracker)) {
      this.config.accounts = tracker;
    } else if (typeof tracker === 'object') {
      this.config.accounts = [tracker];
    } else {
      this.config.accounts = [{ tracker: tracker, trackEvent: true }];
    }
  }

  public trackPages(val: boolean) {
    this.config.trackRoutes = !!val;
  }

  public trackPrefix(prefix: string) {
    this.config.trackPrefix = prefix;
  }

  public setDomainName(domain: string) {
    this.config.domainName = domain;
  }

  public useDisplayFeatures(val: boolean) {
    this.config.displayFeatures = !!val;
  }

  public useAnalytics(val: boolean) {
    this.config.analyticsJS = !!val;
  }

  public useEnhancedLinkAttribution(val: boolean) {
    this.config.enhancedLinkAttribution = !!val;
  }

  public useCrossDomainLinker(val: boolean) {
    this.config.crossDomainLinker = !!val;
  }

  public setCrossLinkDomains(domains: string[]) {
    this.config.crossLinkDomains = domains;
  }

  public setPageEvent(name: string) {
    this.config.pageEvent = name;
  }

  public useECommerce(val: boolean, enhanced: boolean) {
    this.config.ecommerce = !!val;
    this.config.enhancedEcommerce = !!enhanced;
  }

  public setCurrency(currencyCode: string) {
    this.config.currency = currencyCode;
  }

  public setRemoveRegExp(regex: RegExp) {
    if (regex instanceof RegExp) {
      this.config.removeRegExp = regex;
    }
  }

  public setExperimentId(id: string) {
    this.config.experimentId = id;
  }

  public ignoreFirstPageLoad(val: boolean) {
    this.config.ignoreFirstPageLoad = !!val;
  }

  public trackUrlParams(val: boolean) {
    this.config.trackUrlParams = !!val;
  }

  public disableAnalytics(val: boolean) {
    this.config.disableAnalytics = !!val;
  }

  public setHybridMobileSupport(val: boolean) {
    this.config.hybridMobileSupport = !!val;
  }

  public startOffline(val: boolean) {
    this.config.offlineMode = !!val;
    if (this.config.offlineMode) {
      this.delayScriptTag(true);
    }
  }

  public delayScriptTag(val: boolean) {
    this.config.delayScriptTag = !!val;
  }

  public logAllCalls(val: boolean) {
    this.config.logAllCalls = !!val;
  }

  public enterTestMode() {
    this.config.testMode = true;
  }

  public enterDebugMode(enableTraceDebugging: boolean) {
    this.config.debugMode = true;
    this.config.traceDebuggingMode = !!enableTraceDebugging;
  }

  public readFromRoute(val: boolean) {
    this.config.readFromRoute = !!val;
  }

  // Additional methods for tracking events, page views, etc., would be implemented here.
}

// Usage within a React component
const useAnalytics = (config: AnalyticsConfig) => {
  const [analytics, setAnalytics] = useState<AnalyticsService | null>(null);

  useEffect(() => {
    const service = new AnalyticsService(config);
    setAnalytics(service);
    // Setup listeners or perform initial tracking actions here
  }, [config]);

  return analytics;
};

export default useAnalytics;