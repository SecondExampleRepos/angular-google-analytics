import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

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

class Analytics {
  private log: any[] = [];
  private offlineQueue: any[] = [];
  private config: AnalyticsConfig = {
    accounts: [],
    universalAnalytics: true,
    crossDomainLinker: false,
    crossLinkDomains: [],
    currency: 'USD',
    debugMode: false,
    delayScriptTag: false,
    disableAnalytics: false,
    displayFeatures: false,
    domainName: '',
    ecommerce: false,
    enhancedEcommerce: false,
    enhancedLinkAttribution: false,
    experimentId: '',
    hybridMobileSupport: false,
    ignoreFirstPageLoad: false,
    logAllCalls: false,
    pageEvent: '$routeChangeSuccess',
    readFromRoute: false,
    removeRegExp: undefined,
    testMode: false,
    traceDebuggingMode: false,
    trackPrefix: '',
    trackRoutes: true,
    trackUrlParams: false,
  };

  constructor() {
    // Initialize the service
  }

  private isFunction(fn: any): boolean {
    return typeof fn === 'function';
  }

  private isPropertyDefined(key: string, config: any): boolean {
    return typeof config === 'object' && config !== null && key in config;
  }

  private isPropertySetTo(key: string, config: any, value: any): boolean {
    return this.isPropertyDefined(key, config) && config[key] === value;
  }

  private generateCommandName(commandName: string, config: any): string {
    if (typeof config === 'string') {
      return `${config}.${commandName}`;
    }
    return this.isPropertyDefined('name', config) ? `${config.name}.${commandName}` : commandName;
  }

  private getUrl(): string {
    // SECOND AGENT: [MISSING CONTEXT] - Need to determine how to get the URL in React
    return '';
  }

  private getUtmParams(): any {
    // SECOND AGENT: [MISSING CONTEXT] - Need to determine how to get UTM params in React
    return {};
  }

  private getActionFieldObject(id: string, affiliation: string, revenue: string, tax: string, shipping: string, coupon: string, list: string, step: string, option: string): any {
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
  }

  private _getTrackPrefixUrl(url?: string): string {
    return this.config.trackPrefix + (url ? url : this.getUrl());
  }

  private _getProtocol(httpPostfix?: string, httpsPostfix?: string): string {
    const protocol = '';
    const isSslEnabled = document.location.protocol === 'https:';
    const isChromeExtension = document.location.protocol === 'chrome-extension:';
    const isHybridApplication = this.config.universalAnalytics === true && this.config.hybridMobileSupport === true;
    httpPostfix = typeof httpPostfix === 'string' ? httpPostfix : '';
    httpsPostfix = typeof httpsPostfix === 'string' ? httpsPostfix : '';
    if (httpPostfix !== '') {
      return 'http:' + httpPostfix;
    }
    if (isChromeExtension || isHybridApplication || (isSslEnabled && httpsPostfix !== '')) {
      return 'https:' + httpsPostfix;
    }
    return protocol;
  }

  private _gaJs(fn: Function): void {
    if (!this.config.universalAnalytics && window['_gaq'] && this.isFunction(fn)) {
      fn();
    }
  }

  private _gaq(...args: any[]): void {
    if (this.config.disableAnalytics) return;
    if (!window['_gaq']) {
      window['_gaq'] = [];
    }
    if (this.config.logAllCalls) {
      this._log(...args);
    }
    window['_gaq'].push(args);
  }

  private _analyticsJs(fn: Function): void {
    if (this.config.universalAnalytics && window['ga'] && this.isFunction(fn)) {
      fn();
    }
  }

  private _ga(...args: any[]): void {
    if (this.config.disableAnalytics) return;
    if (!this.isFunction(window['ga'])) {
      this._log('warn', 'ga function not set on window');
      return;
    }
    if (this.config.logAllCalls) {
      this._log(...args);
    }
    window['ga'](...args);
  }

  private _gaMultipleTrackers(includeFn: Function, ...args: any[]): void {
    const commandName = args[0];
    const trackers = this.config.accounts.filter(includeFn);
    if (trackers.length === 0) {
      this._ga(...args);
      return;
    }
    trackers.forEach((tracker) => {
      if (this.isPropertyDefined('select', tracker) && this.isFunction(tracker.select) && !tracker.select(args)) {
        return;
      }
      args[0] = this.generateCommandName(commandName, tracker);
      this._ga(...args);
    });
  }

  private _log(...args: any[]): void {
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
      this.log.push(args);
    }
  }

  private _registerScriptTags(): boolean {
    const protocol = this._getProtocol();
    let scriptSource: string;

    if (this.config.disableAnalytics) {
      this.config.accounts.forEach((trackerObj) => {
        this._log('info', 'Analytics disabled: ' + trackerObj.tracker);
        window['ga-disable-' + trackerObj.tracker] = true;
      });
    }

    if (this.config.universalAnalytics) {
      scriptSource = protocol + '//www.google-analytics.com/' + (this.config.debugMode ? 'analytics_debug.js' : 'analytics.js');
      if (!this.config.testMode) {
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
        if (!this.isFunction(window['ga'])) {
          window['ga'] = function () { };
        }
        this._log('inject', scriptSource);
      }

      if (this.config.traceDebuggingMode) {
        window['ga_debug'] = { trace: true };
      }

      if (this.config.experimentId) {
        const expScript = document.createElement('script');
        const s = document.getElementsByTagName('script')[0];
        expScript.src = protocol + '//www.google-analytics.com/cx/api.js?experiment=' + this.config.experimentId;
        s.parentNode.insertBefore(expScript, s);
      }
    } else {
      scriptSource = this._getProtocol('//www', '//ssl') + '.google-analytics.com/ga.js';
      if (this.config.displayFeatures) {
        scriptSource = protocol + '//stats.g.doubleclick.net/dc.js';
      }

      if (!this.config.testMode) {
        (function () {
          const ga = document.createElement('script');
          ga.type = 'text/javascript';
          ga.async = true;
          ga.src = scriptSource;
          const s = document.getElementsByTagName('script')[0];
          s.parentNode.insertBefore(ga, s);
        })();
      } else {
        this._log('inject', scriptSource);
      }
    }

    return true;
  }

  private _registerTrackers(): boolean {
    if (!this.config.accounts || this.config.accounts.length < 1) {
      this._log('warn', 'No accounts to register');
      return false;
    }

    if (this.config.universalAnalytics) {
      this.config.accounts.forEach((trackerObj) => {
        trackerObj.crossDomainLinker = this.isPropertyDefined('crossDomainLinker', trackerObj) ? trackerObj.crossDomainLinker : this.config.crossDomainLinker;
        trackerObj.crossLinkDomains = this.isPropertyDefined('crossLinkDomains', trackerObj) ? trackerObj.crossLinkDomains : this.config.crossLinkDomains;
        trackerObj.displayFeatures = this.isPropertyDefined('displayFeatures', trackerObj) ? trackerObj.displayFeatures : this.config.displayFeatures;
        trackerObj.enhancedLinkAttribution = this.isPropertyDefined('enhancedLinkAttribution', trackerObj) ? trackerObj.enhancedLinkAttribution : this.config.enhancedLinkAttribution;
        trackerObj.set = this.isPropertyDefined('set', trackerObj) ? trackerObj.set : {};
        trackerObj.trackEcommerce = this.isPropertyDefined('trackEcommerce', trackerObj) ? trackerObj.trackEcommerce : this.config.ecommerce;
        trackerObj.trackEvent = this.isPropertyDefined('trackEvent', trackerObj) ? trackerObj.trackEvent : false;

        const fields: any = {};
        if (this.isPropertyDefined('fields', trackerObj)) {
          Object.assign(fields, trackerObj.fields);
        }
        if (trackerObj.crossDomainLinker) {
          fields.allowLinker = true;
        }
        if (this.isPropertyDefined('name', trackerObj)) {
          fields.name = trackerObj.name;
        }
        trackerObj.fields = fields;

        this._ga('create', trackerObj.tracker, trackerObj.fields);

        if (this.config.hybridMobileSupport) {
          this._ga(this.generateCommandName('set', trackerObj), 'checkProtocolTask', null);
        }

        for (const key in trackerObj.set) {
          if (trackerObj.set.hasOwnProperty(key)) {
            this._ga(this.generateCommandName('set', trackerObj), key, trackerObj.set[key]);
          }
        }

        if (trackerObj.crossDomainLinker) {
          this._ga(this.generateCommandName('require', trackerObj), 'linker');
          if (trackerObj.crossLinkDomains) {
            this._ga(this.generateCommandName('linker:autoLink', trackerObj), trackerObj.crossLinkDomains);
          }
        }

        if (trackerObj.displayFeatures) {
          this._ga(this.generateCommandName('require', trackerObj), 'displayfeatures');
        }

        if (trackerObj.trackEcommerce) {
          if (!this.config.enhancedEcommerce) {
            this._ga(this.generateCommandName('require', trackerObj), 'ecommerce');
          } else {
            this._ga(this.generateCommandName('require', trackerObj), 'ec');
            this._ga(this.generateCommandName('set', trackerObj), '&cu', this.config.currency);
          }
        }

        if (trackerObj.enhancedLinkAttribution) {
          this._ga(this.generateCommandName('require', trackerObj), 'linkid');
        }

        if (this.config.trackRoutes && !this.config.ignoreFirstPageLoad) {
          this._ga(this.generateCommandName('send', trackerObj), 'pageview', this._getTrackPrefixUrl());
        }
      });
    } else {
      if (this.config.accounts.length > 1) {
        this._log('warn', 'Multiple trackers are not supported with ga.js. Using first tracker only');
        this.config.accounts = this.config.accounts.slice(0, 1);
      }

      this._gaq('_setAccount', this.config.accounts[0].tracker);
      if (this.config.domainName) {
        this._gaq('_setDomainName', this.config.domainName);
      }
      if (this.config.enhancedLinkAttribution) {
        this._gaq('_require', 'inpage_linkid', '//www.google-analytics.com/plugins/ga/inpage_linkid.js');
      }
      if (this.config.trackRoutes && !this.config.ignoreFirstPageLoad) {
        if (this.config.removeRegExp) {
          this._gaq('_trackPageview', this.getUrl());
        } else {
          this._gaq('_trackPageview');
        }
      }
    }

    return true;
  }

  private _ecommerceEnabled(warn: boolean, command: string): boolean {
    const result = this.config.ecommerce && !this.config.enhancedEcommerce;
    if (warn && !result) {
      if (this.config.ecommerce && this.config.enhancedEcommerce) {
        this._log('warn', `${command} is not available when Enhanced Ecommerce is enabled with analytics.js`);
      } else {
        this._log('warn', `Ecommerce must be enabled to use ${command} with analytics.js`);
      }
    }
    return result;
  }

  private _enhancedEcommerceEnabled(warn: boolean, command: string): boolean {
    const result = this.config.ecommerce && this.config.enhancedEcommerce;
    if (warn && !result) {
      this._log('warn', `Enhanced Ecommerce must be enabled to use ${command} with analytics.js`);
    }
    return result;
  }

  private _trackPage(url?: string, title?: string, custom?: any): void {
    title = title || document.title;
    this._gaJs(() => {
      this._gaq('_set', 'title', title);
      this._gaq('_trackPageview', this._getTrackPrefixUrl(url));
    });
    this._analyticsJs(() => {
      const opt_fieldObject: any = {
        page: this._getTrackPrefixUrl(url),
        title: title,
      };
      Object.assign(opt_fieldObject, this.getUtmParams());
      if (typeof custom === 'object') {
        Object.assign(opt_fieldObject, custom);
      }
      this._gaMultipleTrackers(undefined, 'send', 'pageview', opt_fieldObject);
    });
  }

  private _trackEvent(category: string, action: string, label?: string, value?: number, noninteraction?: boolean, custom?: any): void {
    this._gaJs(() => {
      this._gaq('_trackEvent', category, action, label, value, !!noninteraction);
    });
    this._analyticsJs(() => {
      const opt_fieldObject: any = {};
      const includeFn = (trackerObj: any) => this.isPropertySetTo('trackEvent', trackerObj, true);

      if (noninteraction !== undefined) {
        opt_fieldObject.nonInteraction = !!noninteraction;
      }
      if (typeof custom === 'object') {
        Object.assign(opt_fieldObject, custom);
      }
      if (!opt_fieldObject.page) {
        opt_fieldObject.page = this._getTrackPrefixUrl();
      }
      this._gaMultipleTrackers(includeFn, 'send', 'event', category, action, label, value, opt_fieldObject);
    });
  }

  private _addTrans(transactionId: string, affiliation: string, total: string, tax: string, shipping: string, city: string, state: string, country: string, currency: string): void {
    this._gaJs(() => {
      this._gaq('_addTrans', transactionId, affiliation, total, tax, shipping, city, state, country);
    });
    this._analyticsJs(() => {
      if (this._ecommerceEnabled(true, 'addTrans')) {
        const includeFn = (trackerObj: any) => this.isPropertySetTo('trackEcommerce', trackerObj, true);

        this._gaMultipleTrackers(
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
  }

  private _addItem(transactionId: string, sku: string, name: string, category: string, price: string, quantity: string): void {
    this._gaJs(() => {
      this._gaq('_addItem', transactionId, sku, name, category, price, quantity);
    });
    this._analyticsJs(() => {
      if (this._ecommerceEnabled(true, 'addItem')) {
        const includeFn = (trackerObj: any) => this.isPropertySetTo('trackEcommerce', trackerObj, true);

        this._gaMultipleTrackers(
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
  }

  private _trackTrans(): void {
    this._gaJs(() => {
      this._gaq('_trackTrans');
    });
    this._analyticsJs(() => {
      if (this._ecommerceEnabled(true, 'trackTrans')) {
        const includeFn = (trackerObj: any) => this.isPropertySetTo('trackEcommerce', trackerObj, true);

        this._gaMultipleTrackers(includeFn, 'ecommerce:send');
      }
    });
  }

  private _clearTrans(): void {
    this._analyticsJs(() => {
      if (this._ecommerceEnabled(true, 'clearTrans')) {
        const includeFn = (trackerObj: any) => this.isPropertySetTo('trackEcommerce', trackerObj, true);

        this._gaMultipleTrackers(includeFn, 'ecommerce:clear');
      }
    });
  }

  private _addProduct(productId: string, name: string, category: string, brand: string, variant: string, price: string, quantity: string, coupon: string, position: string, custom: any): void {
    this._gaJs(() => {
      this._gaq('_addProduct', productId, name, category, brand, variant, price, quantity, coupon, position);
    });
    this._analyticsJs(() => {
      if (this._enhancedEcommerceEnabled(true, 'addProduct')) {
        const includeFn = (trackerObj: any) => this.isPropertySetTo('trackEcommerce', trackerObj, true);
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
        if (typeof custom === 'object') {
          Object.assign(details, custom);
        }
        this._gaMultipleTrackers(includeFn, 'ec:addProduct', details);
      }
    });
  }

  private _addImpression(id: string, name: string, list: string, brand: string, category: string, variant: string, position: string, price: string): void {
    this._gaJs(() => {
      this._gaq('_addImpression', id, name, list, brand, category, variant, position, price);
    });
    this._analyticsJs(() => {
      if (this._enhancedEcommerceEnabled(true, 'addImpression')) {
        const includeFn = (trackerObj: any) => this.isPropertySetTo('trackEcommerce', trackerObj, true);

        this._gaMultipleTrackers(
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
  }

  private _addPromo(productId: string, name: string, creative: string, position: string): void {
    this._gaJs(() => {
      this._gaq('_addPromo', productId, name, creative, position);
    });
    this._analyticsJs(() => {
      if (this._enhancedEcommerceEnabled(true, 'addPromo')) {
        const includeFn = (trackerObj: any) => this.isPropertySetTo('trackEcommerce', trackerObj, true);

        this._gaMultipleTrackers(
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
  }

  private _setAction(action: string, obj: any): void {
    this._gaJs(() => {
      this._gaq('_setAction', action, obj);
    });
    this._analyticsJs(() => {
      if (this._enhancedEcommerceEnabled(true, 'setAction')) {
        const includeFn = (trackerObj: any) => this.isPropertySetTo('trackEcommerce', trackerObj, true);

        this._gaMultipleTrackers(includeFn, 'ec:setAction', action, obj);
      }
    });
  }

  private _trackTransaction(transactionId: string, affiliation: string, revenue: string, tax: string, shipping: string, coupon: string, list: string, step: string, option: string): void {
    this._setAction('purchase', this.getActionFieldObject(transactionId, affiliation, revenue, tax, shipping, coupon, list, step, option));
  }

  private _trackRefund(transactionId: string): void {
    this._setAction('refund', this.getActionFieldObject(transactionId));
  }

  private _trackCheckOut(step: string, option: string): void {
    this._setAction('checkout', this.getActionFieldObject(null, null, null, null, null, null, null, step, option));
  }

  private _trackDetail(): void {
    this._setAction('detail');
    this._pageView();
  }

  private _trackCart(action: string, listName: string): void {
    if (['add', 'remove'].indexOf(action) !== -1) {
      this._setAction(action, { list: listName });
      this._trackEvent('UX', 'click', action + (action === 'add' ? ' to cart' : ' from cart'));
    }
  }

  private _promoClick(promotionName: string): void {
    this._setAction('promo_click');
    this._trackEvent('Internal Promotions', 'click', promotionName);
  }

  private _productClick(listName: string): void {
    this._setAction('click', this.getActionFieldObject(null, null, null, null, null, null, listName, null, null));
    this._trackEvent('UX', 'click', listName);
  }

  private _pageView(trackerName?: string): void {
    this._analyticsJs(() => {
      this._ga(this.generateCommandName('send', trackerName), 'pageview');
    });
  }

  private _send(...args: any[]): void {
    args.unshift('send');
    this._analyticsJs(() => {
      this._ga(...args);
    });
  }

  private _set(name: string, value: any, trackerName?: string): void {
    this._analyticsJs(() => {
      this._ga(this.generateCommandName('set', trackerName), name, value);
    });
  }

  private _trackTimings(timingCategory: string, timingVar: string, timingValue: number, timingLabel?: string): void {
    this._analyticsJs(() => {
      this._gaMultipleTrackers(undefined, 'send', 'timing', timingCategory, timingVar, timingValue, timingLabel);
    });
  }

  private _trackException(description?: string, isFatal?: boolean): void {
    this._analyticsJs(() => {
      this._gaMultipleTrackers(undefined, 'send', 'exception', { exDescription: description, exFatal: !!isFatal });
    });
  }

  public trackPage(url?: string, title?: string, custom?: any): void {
    this._trackPage(url, title, custom);
  }

  public trackEvent(category: string, action: string, label?: string, value?: number, noninteraction?: boolean, custom?: any): void {
    this._trackEvent(category, action, label, value, noninteraction, custom);
  }

  public addTrans(transactionId: string, affiliation: string, total: string, tax: string, shipping: string, city: string, state: string, country: string, currency: string): void {
    this._addTrans(transactionId, affiliation, total, tax, shipping, city, state, country, currency);
  }

  public addItem(transactionId: string, sku: string, name: string, category: string, price: string, quantity: string): void {
    this._addItem(transactionId, sku, name, category, price, quantity);
  }

  public trackTrans(): void {
    this._trackTrans();
  }

  public clearTrans(): void {
    this._clearTrans();
  }

  public addProduct(productId: string, name: string, category: string, brand: string, variant: string, price: string, quantity: string, coupon: string, position: string, custom: any): void {
    this._addProduct(productId, name, category, brand, variant, price, quantity, coupon, position, custom);
  }

  public addPromo(productId: string, name: string, creative: string, position: string): void {
    this._addPromo(productId, name, creative, position);
  }

  public addImpression(productId: string, name: string, list: string, brand: string, category: string, variant: string, position: string, price: string): void {
    this._addImpression(productId, name, list, brand, category, variant, position, price);
  }

  public productClick(listName: string): void {
    this._productClick(listName);
  }

  public promoClick(promotionName: string): void {
    this._promoClick(promotionName);
  }

  public trackDetail(): void {
    this._trackDetail();
  }

  public trackCart(action: string, list: string): void {
    this._trackCart(action, list);
  }

  public trackCheckout(step: string, option: string): void {
    this._trackCheckOut(step, option);
  }

  public trackTimings(timingCategory: string, timingVar: string, timingValue: number, timingLabel?: string): void {
    this._trackTimings(timingCategory, timingVar, timingValue, timingLabel);
  }

  public trackTransaction(transactionId: string, affiliation: string, revenue: string, tax: string, shipping: string, coupon: string, list: string, step: string, option: string): void {
    this._trackTransaction(transactionId, affiliation, revenue, tax, shipping, coupon, list, step, option);
  }

  public trackException(description?: string, isFatal?: boolean): void {
    this._trackException(description, isFatal);
  }

  public setAction(action: string, obj: any): void {
    this._setAction(action, obj);
  }

  public pageView(): void {
    this._pageView();
  }

  public send(obj: any): void {
    this._send(obj);
  }

  public set(name: string, value: any, trackerName?: string): void {
    this._set(name, value, trackerName);
  }
}

export default Analytics;