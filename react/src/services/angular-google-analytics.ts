import { useEffect, useState } from 'react';

interface AnalyticsConfig {
  accounts: any[];
  universalAnalytics: boolean;
  crossDomainLinker: boolean;
  crossLinkDomains: string[];
  currency: string;
  debugMode: boolean;
  delayScriptTag: boolean;
  disableAnalytics: boolean;
  displayFeatures: boolean;
  domainName: string;
  ecommerce: boolean;
  enhancedEcommerce: boolean;
  enhancedLinkAttribution: boolean;
  experimentId: string;
  hybridMobileSupport: boolean;
  ignoreFirstPageLoad: boolean;
  logAllCalls: boolean;
  pageEvent: string;
  readFromRoute: boolean;
  removeRegExp: RegExp | null;
  testMode: boolean;
  traceDebuggingMode: boolean;
  trackPrefix: string;
  trackRoutes: boolean;
  trackUrlParams: boolean;
}

class AnalyticsService {
  private config: AnalyticsConfig;
  private log: any[] = [];
  private offlineQueue: any[] = [];

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  private getUrl(): string {
    // Implement URL retrieval logic based on configuration
    return window.location.pathname; // Simplified example
  }

  trackPage(url?: string, title?: string, custom?: object) {
    const pageUrl = url || this.getUrl();
    const pageTitle = title || document.title;
    const trackingInfo = {
      page: this.config.trackPrefix + pageUrl,
      title: pageTitle,
      ...custom
    };
    window.ga('send', 'pageview', trackingInfo);
  }

  trackEvent(category: string, action: string, label?: string, value?: number, noninteraction?: boolean, custom?: object) {
    const eventInfo = {
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      eventValue: value,
      nonInteraction: noninteraction,
      ...custom
    };
    window.ga('send', 'event', eventInfo);
  }

  // Additional methods for ecommerce, exceptions, etc., can be similarly implemented

  initialize() {
    if (!this.config.delayScriptTag) {
      this.loadAnalyticsScript();
    }
  }

  private loadAnalyticsScript() {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.google-analytics.com/analytics.js';
    document.head.appendChild(script);

    script.onload = () => {
      window.ga('create', this.config.accounts[0].tracker, 'auto');
      if (this.config.trackRoutes && !this.config.ignoreFirstPageLoad) {
        this.trackPage();
      }
    };
  }
}

// Usage in a React component
const useAnalytics = (config: AnalyticsConfig) => {
  const [analytics, setAnalytics] = useState<AnalyticsService | null>(null);

  useEffect(() => {
    const analyticsService = new AnalyticsService(config);
    analyticsService.initialize();
    setAnalytics(analyticsService);
  }, [config]);

  return analytics;
};

export default useAnalytics;