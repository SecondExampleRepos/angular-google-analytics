import { useEffect, useState } from 'react';

interface AnalyticsConfig {
  accounts?: any[];
  analyticsJS?: boolean;
  crossDomainLinker?: boolean;
  crossLinkDomains?: string[];
  currency?: string;
  debugMode?: boolean;
  delayScriptTag?: boolean;
  disableAnalytics?: boolean;
  domainName?: string;
  ecommerce?: boolean;
  enhancedEcommerce?: boolean;
  enhancedLinkAttribution?: boolean;
  experimentId?: string;
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

class AnalyticsService {
  private config: AnalyticsConfig;
  private log: any[] = [];
  private offlineQueue: any[] = [];

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  setAccount(tracker: any) {
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

  trackPages(val: boolean) {
    this.config.trackRoutes = !!val;
  }

  setDomainName(domain: string) {
    this.config.domainName = domain;
  }

  useDisplayFeatures(val: boolean) {
    this.config.displayFeatures = !!val;
  }

  useAnalytics(val: boolean) {
    this.config.analyticsJS = !!val;
  }

  useEnhancedLinkAttribution(val: boolean) {
    this.config.enhancedLinkAttribution = !!val;
  }

  useCrossDomainLinker(val: boolean) {
    this.config.crossDomainLinker = !!val;
  }

  setCrossLinkDomains(domains: string[]) {
    this.config.crossLinkDomains = domains;
  }

  useECommerce(val: boolean, enhanced: boolean) {
    this.config.ecommerce = !!val;
    this.config.enhancedEcommerce = !!enhanced;
  }

  setCurrency(currencyCode: string) {
    this.config.currency = currencyCode;
  }

  setRemoveRegExp(regex: RegExp) {
    if (regex instanceof RegExp) {
      this.config.removeRegExp = regex;
    }
  }

  setExperimentId(id: string) {
    this.config.experimentId = id;
  }

  ignoreFirstPageLoad(val: boolean) {
    this.config.ignoreFirstPageLoad = !!val;
  }

  trackUrlParams(val: boolean) {
    this.config.trackUrlParams = !!val;
  }

  disableAnalytics(val: boolean) {
    this.config.disableAnalytics = !!val;
  }

  startOffline(val: boolean) {
    this.config.delayScriptTag = !!val;
    if (val) {
      this.offlineQueue = [];
    }
  }

  logAllCalls(val: boolean) {
    this.config.logAllCalls = !!val;
  }

  enterTestMode() {
    this.config.testMode = true;
  }

  enterDebugMode(enableTraceDebugging: boolean) {
    this.config.debugMode = true;
    this.config.traceDebuggingMode = !!enableTraceDebugging;
  }

  // Additional methods for tracking events, pages, transactions, etc., would be implemented here.
}

// Usage within a React component
const useAnalytics = (config: AnalyticsConfig) => {
  const [analytics, setAnalytics] = useState<AnalyticsService | null>(null);

  useEffect(() => {
    const analyticsService = new AnalyticsService(config);
    setAnalytics(analyticsService);
  }, [config]);

  return analytics;
};

export default useAnalytics;