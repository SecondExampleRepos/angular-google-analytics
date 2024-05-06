/* global afterEach, before, beforeEach, describe, document, expect, inject, it, module, spyOn */
'use strict';

import { module, inject } from 'angular';
import { AnalyticsProvider, Analytics } from './analytics'; // Assuming these are defined in a separate file

describe('universal analytics', function () {
  beforeEach(() => module('angular-google-analytics'));
  beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
    AnalyticsProvider
      .setAccount('UA-XXXXXX-xx')
      .useAnalytics(true)
      .logAllCalls(true)
      .enterTestMode();
  }));

  afterEach(inject((Analytics: Analytics) => {
    Analytics.log.length = 0; // clear log
  }));

  describe('required settings missing', function () {
    describe('for analytics script injection', function () {
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.setAccount(undefined);
      }));

      it('should inject a script tag', function () {
        inject((Analytics: Analytics) => {
          expect(Analytics.log.length).toBe(2);
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
        });
      });

      it('should issue a warning to the log', function () {
        inject(($log: any) => {
          spyOn($log, 'warn');
          inject((Analytics: Analytics) => {
            expect(Analytics.log.length).toBe(2);
            expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
            expect(Analytics.log[1]).toEqual(['warn', 'No accounts to register']);
            expect($log.warn).toHaveBeenCalledWith(['No accounts to register']);
          });
        });
      });
    });
  });

  describe('delay script tag', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.delayScriptTag(true);
    }));

    it('should have a truthy value for Analytics.delayScriptTag', function () {
      inject((Analytics: Analytics, $location: any) => {
        expect(Analytics.configuration.delayScriptTag).toBe(true);
      });
    });

    it('should not inject a script tag', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.log.length).toBe(0);
        expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
      });
    });
  });

  describe('automatically create analytics script tag', function () {
    it('should inject the script tag', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
        expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
      });
    });

    it('should warn and prevent a second attempt to inject a script tag', function () {
      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          Analytics.registerScriptTags();
          expect($log.warn).toHaveBeenCalledWith(['Script tags already created']);
        });
      });
    });
  });

  describe('manually create analytics script tag', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.delayScriptTag(true);
    }));

    it('should inject the script tag', function () {
      inject((Analytics: Analytics, $location: any) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
      });
    });

    it('should warn and prevent a second attempt to inject a script tag', function () {
      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          Analytics.registerScriptTags();
          expect($log.warn).toHaveBeenCalledWith(['Script tags already created']);
        });
      });
    });

    describe('with a prefix set', function(){
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider
          .trackPrefix("test-prefix");
      }));

      it('should send the url, including the prefix', function(){
        inject((Analytics: Analytics) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          Analytics.registerTrackers();
          expect(Analytics.log[2]).toEqual(['send', 'pageview', 'test-prefix']);
        });
      });

      it('should send the url, including the prefix with each event', function() {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; // clear log
            Analytics.trackEvent('test', 'action', 'label', 0);
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', 'action', 'label', 0, { page: 'test-prefix' });
          });
        });
      });
    });
  });

  describe('hybrid mobile application support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider
        .setHybridMobileSupport(true)
        .delayScriptTag(true);
    }));

    it('should support hybridMobileSupport', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.hybridMobileSupport).toBe(true);
      });
    });

    it('should inject a script tag with the HTTPS protocol and set checkProtocolTask to null', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.registerScriptTags();
        Analytics.registerTrackers();
        expect(Analytics.log[0]).toEqual(['inject', 'https://www.google-analytics.com/analytics.js']);
        expect(Analytics.log[1]).toEqual(['create', 'UA-XXXXXX-xx', {}]);
        expect(Analytics.log[2]).toEqual(['set', 'checkProtocolTask', null]);
      });
    });
  });

  describe('account custom set commands support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider
        .setAccount({
          tracker: 'UA-XXXXXX-xx',
          set: {
            forceSSL: true
          }
        })
        .setHybridMobileSupport(true)
        .delayScriptTag(true);
    }));

    it('should set the account object to use forceSSL', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.registerScriptTags();
        Analytics.registerTrackers();
        expect(Analytics.log[0]).toEqual(['inject', 'https://www.google-analytics.com/analytics.js']);
        expect(Analytics.log[1]).toEqual(['create', 'UA-XXXXXX-xx', {}]);
        expect(Analytics.log[2]).toEqual(['set', 'checkProtocolTask', null]);
        expect(Analytics.log[3]).toEqual(['set', 'forceSSL', true]);
      });
    });
  });

  describe('account select support', function () {
    var account;

    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
       account = {
        tracker: 'UA-XXXXXX-xx',
        select: function () {
          return false;
        }
      };
      spyOn(account, 'select');
      AnalyticsProvider.setAccount(account);
    }));

    it('should not run with commands after configuration when select returns false', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.trackPage('/path/to', 'title');
        expect(Analytics.log.length).toEqual(0);
        expect(account.select).toHaveBeenCalledWith(['send', 'pageview', { page: '/path/to', title: 'title' }]);
      });
    });
  });

  describe('ignoreFirstPageLoad configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.ignoreFirstPageLoad(true);
    }));

    it('should support ignoreFirstPageLoad', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.ignoreFirstPageLoad).toBe(true);
      });
    });
  });

  describe('displayFeature configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useDisplayFeatures(true);
    }));

    it('should support displayFeatures config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.displayFeatures).toBe(true);
      });
    });
  });

  describe('enhancedLinkAttribution configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useEnhancedLinkAttribution(true);
    }));

    it('should support enhancedLinkAttribution config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.enhancedLinkAttribution).toBe(true);
      });
    });
  });

  describe('experiment configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.setExperimentId('12345');
    }));

    it('should support experimentId config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.experimentId).toBe('12345');
      });
    });
  });

  describe('supports custom events, dimensions, and metrics', function () {
    it('should allow sending custom events', function () {
      inject((Analytics: Analytics) => {
        var social = {
          hitType: 'social',
          socialNetwork: 'facebook',
          socialAction: 'like',
          socialTarget: 'http://mycoolpage.com',
          page: '/my-new-page'
        };
        Analytics.log.length = 0; // clear log
        Analytics.send(social);
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['send', social]);
      });
    });

    it('should allow setting custom dimensions, metrics or experiment', function () {
      inject((Analytics: Analytics) => {
        var data = {
          name: 'dimension1',
          value: 'value1'
        };
        Analytics.log.length = 0; // clear log
        Analytics.set(data.name, data.value);
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['set', data.name, data.value]);
      });
    });

    describe('with eventTracks', function () {
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.trackPages(false);
      }));

      it('should generate eventTracks', function () {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; // clear log
            Analytics.trackEvent('test');
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', undefined, undefined, undefined, { page: '' });
          });
        });
      });

      it('should generate eventTracks and honor non-interactions', function () {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; // clear log
            Analytics.trackEvent('test', 'action', 'label', 0, true);
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', 'action', 'label', 0, { nonInteraction: true, page: '' });
          });
        });
      });
    });
  });

  describe('e-commerce transactions with analytics.js', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useECommerce(true);
    }));

    it('should have e-commerce enabled', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.ecommerce).toBe(true);
      });
    });

    it('should have enhanced e-commerce disabled', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.enhancedEcommerce).toBe(false);
      });
    });

    it('should add transcation', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.addTrans('1', '', '2.42', '0.42', '0', 'Amsterdam', '', 'Netherlands');
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0][0]).toEqual('ecommerce:addTransaction');
      });
    });

    it('should add an item to transaction', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.addItem('1', 'sku-1', 'Test product 1', 'Testing', '1', '1');
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0][0]).toEqual('ecommerce:addItem');
      });
    });

    it('should track the transaction', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.trackTrans();
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['ecommerce:send']);
      });
    });

    it('should allow transaction clearing', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.clearTrans();
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['ecommerce:clear']);
      });
    });

    it('should not support enhanced e-commerce commands', function () {
      var commands = [
        'addImpression',
        'addProduct',
        'addPromo',
        'setAction'
      ];

      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          commands.forEach(function (command) {
            Analytics[command]();
            expect($log.warn).toHaveBeenCalledWith(['Enhanced Ecommerce must be enabled to use ' + command + ' with analytics.js']);
          });
        });
      });
    });

    describe('supports multiple tracking objects', function () {
      var trackers = [
        { tracker: 'UA-12345-12', name: 'tracker1', trackEcommerce: true },
        { tracker: 'UA-12345-34', name: 'tracker2', trackEcommerce: false },
        { tracker: 'UA-12345-45', trackEcommerce: true }
      ];

      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.setAccount(trackers);
      }));

      it('should track transactions for configured tracking objects```
/* global afterEach, before, beforeEach, describe, document, expect, inject, it, module, spyOn */
'use strict';

import { module, inject } from 'angular';
import { AnalyticsProvider, Analytics } from './analytics'; // Assuming these are defined in a separate file

describe('universal analytics', function () {
  beforeEach(() => module('angular-google-analytics'));
  beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
    AnalyticsProvider
      .setAccount('UA-XXXXXX-xx')
      .useAnalytics(true)
      .logAllCalls(true)
      .enterTestMode();
  }));

  afterEach(inject((Analytics: Analytics) => {
    Analytics.log.length = 0; // clear log
  }));

  describe('required settings missing', function () {
    describe('for analytics script injection', function () {
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.setAccount(undefined);
      }));

      it('should inject a script tag', function () {
        inject((Analytics: Analytics) => {
          expect(Analytics.log.length).toBe(2);
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
        });
      });

      it('should issue a warning to the log', function () {
        inject(($log: any) => {
          spyOn($log, 'warn');
          inject((Analytics: Analytics) => {
            expect(Analytics.log.length).toBe(2);
            expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
            expect(Analytics.log[1]).toEqual(['warn', 'No accounts to register']);
            expect($log.warn).toHaveBeenCalledWith(['No accounts to register']);
          });
        });
      });
    });
  });

  describe('delay script tag', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.delayScriptTag(true);
    }));

    it('should have a truthy value for Analytics.delayScriptTag', function () {
      inject((Analytics: Analytics, $location: any) => {
        expect(Analytics.configuration.delayScriptTag).toBe(true);
      });
    });

    it('should not inject a script tag', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.log.length).toBe(0);
        expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
      });
    });
  });

  describe('automatically create analytics script tag', function () {
    it('should inject the script tag', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
        expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
      });
    });

    it('should warn and prevent a second attempt to inject a script tag', function () {
      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          Analytics.registerScriptTags();
          expect($log.warn).toHaveBeenCalledWith(['Script tags already created']);
        });
      });
    });
  });

  describe('manually create analytics script tag', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.delayScriptTag(true);
    }));

    it('should inject the script tag', function () {
      inject((Analytics: Analytics, $location: any) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
      });
    });

    it('should warn and prevent a second attempt to inject a script tag', function () {
      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          Analytics.registerScriptTags();
          expect($log.warn).toHaveBeenCalledWith(['Script tags already created']);
        });
      });
    });

    describe('with a prefix set', function(){
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider
          .trackPrefix("test-prefix");
      }));

      it('should send the url, including the prefix', function(){
        inject((Analytics: Analytics) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          Analytics.registerTrackers();
          expect(Analytics.log[2]).toEqual(['send', 'pageview', 'test-prefix']);
        });
      });

      it('should send the url, including the prefix with each event', function() {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; // clear log
            Analytics.trackEvent('test', 'action', 'label', 0);
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', 'action', 'label', 0, { page: 'test-prefix' });
          });
        });
      });
    });
  });

  describe('hybrid mobile application support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider
        .setHybridMobileSupport(true)
        .delayScriptTag(true);
    }));

    it('should support hybridMobileSupport', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.hybridMobileSupport).toBe(true);
      });
    });

    it('should inject a script tag with the HTTPS protocol and set checkProtocolTask to null', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.registerScriptTags();
        Analytics.registerTrackers();
        expect(Analytics.log[0]).toEqual(['inject', 'https://www.google-analytics.com/analytics.js']);
        expect(Analytics.log[1]).toEqual(['create', 'UA-XXXXXX-xx', {}]);
        expect(Analytics.log[2]).toEqual(['set', 'checkProtocolTask', null]);
      });
    });
  });

  describe('account custom set commands support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider
        .setAccount({
          tracker: 'UA-XXXXXX-xx',
          set: {
            forceSSL: true
          }
        })
        .setHybridMobileSupport(true)
        .delayScriptTag(true);
    }));

    it('should set the account object to use forceSSL', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; – clear log
        Analytics.registerScriptTags();
        Analytics.registerTrackers();
        expect(Analytics.log[0]).toEqual(['inject', 'https://www.google-analytics.com/analytics.js']);
        expect(Analytics.log[1]).toEqual(['create', 'UA-XXXXXX-xx', {}]);
        expect(Analytics.log[2]).toEqual(['set', 'checkProtocolTask', null]);
        expect(Analytics.log[3]).toEqual(['set', 'forceSSL', true]);
      });
    });
  });

  describe('account select support', function () {
    var account;

    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
       account = {
        tracker: 'UA-XXXXXX-xx',
        select: function () {
          return false;
        }
      };
      spyOn(account, 'select');
      AnalyticsProvider.setAccount(account);
    }));

    it('should not run with commands after configuration when select returns false', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; – clear log
        Analytics.trackPage('/path/to', 'title');
        expect(Analytics.log.length).toEqual(0);
        expect(account.select).toHaveBeenCalledWith(['send', 'pageview', { page: '/path/to', title: 'title' }]);
      });
    });
  });

  describe('ignoreFirstPageLoad configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.ignoreFirstPageLoad(true);
    }));

    it('should support ignoreFirstPageLoad', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.ignoreFirstPageLoad).toBe(true);
      });
    });
  });

  describe('displayFeature configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useDisplayFeatures(true);
    }));

    it('should support displayFeatures config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.displayFeatures).toBe(true);
      });
    });
  });

  describe('enhancedLinkAttribution configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useEnhancedLinkAttribution(true);
    }));

    it('should support enhancedLinkAttribution config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.enhancedLinkAttribution).toBe(true);
      });
    });
  });

  describe('experiment configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.setExperimentId('12345');
    }));

    it('should support experimentId config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.experimentId).toBe('12345');
      });
    });
  });

  describe('supports custom events, dimensions, and metrics', function () {
    it('should allow sending custom events', function () {
      inject((Analytics: Analytics) => {
        var social = {
          hitType: 'social',
          socialNetwork: 'facebook',
          socialAction: 'like',
          socialTarget: 'http://mycoolpage.com',
          page: '/my-new-page'
        };
        Analytics.log.length = 0; – clear log
        Analytics.send(social);
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['send', social]);
      });
    });

    it('should allow setting custom dimensions, metrics or experiment', function () {
      inject((Analytics: Analytics) => {
        var data = {
          name: 'dimension1',
          value: 'value1'
        };
        Analytics.log.length = 0; – clear log
        Analytics.set(data.name, data.value);
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['set', data.name, data.value]);
      });
    });

    describe('with eventTracks', function () {
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.trackPages(false);
      }));

      it('should generate eventTracks', function () {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; – clear log
            Analytics.trackEvent('test');
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', undefined, undefined, undefined, { page: '' });
          });
        });
      });

      it('should generate eventTracks and honor non-interactions', function () {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; – clear log
            Analytics.trackEvent('test', 'action', 'label', 0, true);
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', 'action', 'label', 0, { nonInteraction: true, page: '' });
          });
        });
      });
    });
  });

  describe('e-commerce transactions with analytics.js', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useECommerce(true);
    }));

    it('should have e-commerce enabled', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.ecommerce).toBe(true);
      });
    });

    it('should have enhanced e-commerce disabled', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.enhancedEcommerce).toBe(false);
      });
    });

    it('should add transcation', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; – clear log
        Analytics.addTrans('1', '', '2.42', '0.42', '0', 'Amsterdam', '', 'Netherlands');
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0][0]).toEqual('ecommerce:addTransaction');
      });
    });

    it('should add an item to transaction', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; – clear log
        Analytics.addItem('1', 'sku-1', 'Test product 1', 'Testing', '1', '1');
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0][0]).toEqual('ecommerce:addItem');
      });
    });

    it('should track the transaction', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; – clear log
        Analytics.trackTrans();
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['ecommerce:send']);
      });
    });

    it('should allow transaction clearing', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; – clear log
        Analytics.clearTrans();
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['ecommerce:clear']);
      });
    });

    it('should not support enhanced e-commerce commands', function () {
      var commands = [
        'addImpression',
        'addProduct',
        'addPromo',
        'setAction'
      ];

      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          commands.forEach(function (command) {
            Analytics[command]();
            expect($log.warn).toHaveBeenCalledWith(['Enhanced Ecommerce must be enabled to use ' + command + ' with analytics.js']);
          });
        });
      });
    });

    describe('supports multiple tracking objects', function () {
      var trackers = [
        { tracker: 'UA-12345-12', name: 'tracker1', trackEcommerce: true },
        { tracker: 'UA-12345-34', name: 'tracker2', trackEcommerce: false },
        { tracker: 'UA-12345-45', trackEcommerce: true }
      ];

      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.setAccount(trackers);
      }));

      it('should track transactions for configured tracking objects only',```
/* global afterEach, before, beforeEach, describe, document, expect, inject, it, module, spyOn */
'use strict';

import { module, inject } from 'angular';
import { AnalyticsProvider, Analytics } from './analytics'; // Assuming these are defined in a separate file

describe('universal analytics', function () {
  beforeEach(() => module('angular-google-analytics'));
  beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
    AnalyticsProvider
      .setAccount('UA-XXXXXX-xx')
      .useAnalytics(true)
      .logAllCalls(true)
      .enterTestMode();
  }));

  afterEach(inject((Analytics: Analytics) => {
    Analytics.log.length = 0; // clear log
  }));

  describe('required settings missing', function () {
    describe('for analytics script injection', function () {
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.setAccount(undefined);
      }));

      it('should inject a script tag', function () {
        inject((Analytics: Analytics) => {
          expect(Analytics.log.length).toBe(2);
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
        });
      });

      it('should issue a warning to the log', function () {
        inject(($log: any) => {
          spyOn($log, 'warn');
          inject((Analytics: Analytics) => {
            expect(Analytics.log.length).toBe(2);
            expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
            expect(Analytics.log[1]).toEqual(['warn', 'No accounts to register']);
            expect($log.warn).toHaveBeenCalledWith(['No accounts to register']);
          });
        });
      });
    });
  });

  describe('delay script tag', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.delayScriptTag(true);
    }));

    it('should have a truthy value for Analytics.delayScriptTag', function () {
      inject((Analytics: Analytics, $location: any) => {
        expect(Analytics.configuration.delayScriptTag).toBe(true);
      });
    });

    it('should not inject a script tag', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.log.length).toBe(0);
        expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
      });
    });
  });

  describe('automatically create analytics script tag', function () {
    it('should inject the script tag', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
        expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
      });
    });

    it('should warn and prevent a second attempt to inject a script tag', function () {
      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          Analytics.registerScriptTags();
          expect($log.warn).toHaveBeenCalledWith(['Script tags already created']);
        });
      });
    });
  });

  describe('manually create analytics script tag', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.delayScriptTag(true);
    }));

    it('should inject the script tag', function () {
      inject((Analytics: Analytics, $location: any) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
      });
    });

    it('should warn and prevent a second attempt to inject a script tag', function () {
      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          Analytics.registerScriptTags();
          expect($log.warn).toHaveBeenCalledWith(['Script tags already created']);
        });
      });
    });

    describe('with a prefix set', function(){
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider
          .trackPrefix("test-prefix");
      }));

      it('should send the url, including the prefix', function(){
        inject((Analytics: Analytics) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          Analytics.registerTrackers();
          expect(Analytics.log[2]).toEqual(['send', 'pageview', 'test-prefix']);
        });
      });

      it('should send the url, including the prefix with each event', function() {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; // clear log
            Analytics.trackEvent('test', 'action', 'label', 0);
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', 'action', 'label', 0, { page: 'test-prefix' });
          });
        });
      });
    });
  });

  describe('hybrid mobile application support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider
        .setHybridMobileSupport(true)
        .delayScriptTag(true);
    }));

    it('should support hybridMobileSupport', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.hybridMobileSupport).toBe(true);
      });
    });

    it('should inject a script tag with the HTTPS protocol and set checkProtocolTask to null', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.registerScriptTags();
        Analytics.registerTrackers();
        expect(Analytics.log[0]).toEqual(['inject', 'https://www.google-analytics.com/analytics.js']);
        expect(Analytics.log[1]).toEqual(['create', 'UA-XXXXXX-xx', {}]);
        expect(Analytics.log[2]).toEqual(['set', 'checkProtocolTask', null]);
      });
    });
  });

  describe('account custom set commands support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider
        .setAccount({
          tracker: 'UA-XXXXXX-xx',
          set: {
            forceSSL: true
          }
        })
        .setHybridMobileSupport(true)
        .delayScriptTag(true);
    }));

    it('should set the account object to use forceSSL', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.registerScriptTags();
        Analytics.registerTrackers();
        expect(Analytics.log[0]).toEqual(['inject', 'https://www.google-analytics.com/analytics.js']);
        expect(Analytics.log[1]).toEqual(['create', 'UA-XXXXXX-xx', {}]);
        expect(Analytics.log[2]).toEqual(['set', 'checkProtocolTask', null]);
        expect(Analytics.log[3]).toEqual(['set', 'forceSSL', true]);
      });
    });
  });

  describe('account select support', function () {
    var account;

    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
       account = {
        tracker: 'UA-XXXXXX-xx',
        select: function () {
          return false;
        }
      };
      spyOn(account, 'select');
      AnalyticsProvider.setAccount(account);
    }));

    it('should not run with commands after configuration when select returns false', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.trackPage('/path/to', 'title');
        expect(Analytics.log.length).toEqual(0);
        expect(account.select).toHaveBeenCalledWith(['send', 'pageview', { page: '/path/to', title: 'title' }]);
      });
    });
  });

  describe('ignoreFirstPageLoad configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.ignoreFirstPageLoad(true);
    }));

    it('should support ignoreFirstPageLoad', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.ignoreFirstPageLoad).toBe(true);
      });
    });
  });

  describe('displayFeature configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useDisplayFeatures(true);
    }));

    it('should support displayFeatures config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.displayFeatures).toBe(true);
      });
    });
  });

  describe('enhancedLinkAttribution configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useEnhancedLinkAttribution(true);
    }));

    it('should support enhancedLinkAttribution config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.enhancedLinkAttribution).toBe(true);
      });
    });
  });

  describe('experiment configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.setExperimentId('12345');
    }));

    it('should support experimentId config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.experimentId).toBe('12345');
      });
    });
  });

  describe('supports custom events, dimensions, and metrics', function () {
    it('should allow sending custom events', function () {
      inject((Analytics: Analytics) => {
        var social = {
          hitType: 'social',
          socialNetwork: 'facebook',
          socialAction: 'like',
          socialTarget: 'http://mycoolpage.com',
          page: '/my-new-page'
        };
        Analytics.log.length = 0; // clear log
        Analytics.send(social);
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['send', social]);
      });
    });

    it('should allow setting custom dimensions, metrics or experiment', function () {
      inject((Analytics: Analytics) => {
        var data = {
          name: 'dimension1',
          value: 'value1'
        };
        Analytics.log.length = 0; // clear log
        Analytics.set(data.name, data.value);
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['set', data.name, data.value]);
      });
    });

    describe('with eventTracks', function () {
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.trackPages(false);
      }));

      it('should generate eventTracks', function () {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; // clear log
            Analytics.trackEvent('test');
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', undefined, undefined, undefined, { page: '' });
          });
        });
      });

      it('should generate eventTracks and honor non-interactions', function () {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; // clear log
            Analytics.trackEvent('test', 'action', 'label', 0, true);
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', 'action', 'label', 0, { nonInteraction: true, page: '' });
          });
        });
      });
    });
  });

  describe('e-commerce transactions with analytics.js', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useECommerce(true);
    }));

    it('should have e-commerce enabled', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.ecommerce).toBe(true);
      });
    });

    it('should have enhanced e-commerce disabled', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.enhancedEcommerce).toBe(false);
      });
    });

    it('should add transcation', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.addTrans('1', '', '2.42', '0.42', '0', 'Amsterdam', '', 'Netherlands');
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0][0]).toEqual('ecommerce:addTransaction');
      });
    });

    it('should add an item to transaction', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.addItem('1', 'sku-1', 'Test product 1', 'Testing', '1', '1');
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0][0]).toEqual('ecommerce:addItem');
      });
    });

    it('should track the transaction', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.trackTrans();
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['ecommerce:send']);
      });
    });

    it('should allow transaction clearing', function () {
      inject((Analytics: Analytics) => {
        Analytics.log length = 0; // clear log
        Analytics.clearTrans();
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['ecommerce:clear']);
      });
    });

    it('should not support enhanced e-commerce commands', function () {
      var commands = [
        'addImpression',
        'addProduct',
        'addPromo',
        'setAction'
      ];

      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          commands.forEach(function (command) {
            Analytics[command]();
            expect($log.warn).toHaveBeenCalledWith(['Enhanced Ecommerce must be enabled to use ' + command + ' with analytics.js']);
          });
        });
      });
    });

    describe('supports multiple tracking objects', function () {
      var trackers = [
        { tracker: 'UA-12345-12', name: 'tracker1', trackEcommerce: true },
        { tracker: 'UA-12345-34', name: 'tracker2', trackEcommerce: false },
        { tracker: 'UA-12345-45', trackEcommerce: true }
      ];

      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.setAccount(trackers);
      }));

      it('should track transactions for configured tracking objects only',```
/* global afterEach, before, beforeEach, describe, document, expect, inject, it, module, spyOn */
'use strict';

import { module, inject } from 'angular';
import { AnalyticsProvider, Analytics } from './analytics'; // Assuming these are defined in a separate file

describe('universal analytics', function () {
  beforeEach(() => module('angular-google-analytics'));
  beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
    AnalyticsProvider
      .setAccount('UA-XXXXXX-xx')
      .useAnalytics(true)
      .logAllCalls(true)
      .enterTestMode();
  }));

  afterEach(inject((Analytics: Analytics) => {
    Analytics.log.length = 0; // clear log
  }));

  describe('required settings missing', function () {
    describe('for analytics script injection', function () {
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.setAccount(undefined);
      }));

      it('should inject a script tag', function () {
        inject((Analytics: Analytics) => {
          expect(Analytics.log.length).toBe(2);
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
        });
      });

      it('should issue a warning to the log', function () {
        inject(($log: any) => {
          spyOn($log, 'warn');
          inject((Analytics: Analytics) => {
            expect(Analytics.log.length).toBe(2);
            expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
            expect(Analytics.log[1]).toEqual(['warn', 'No accounts to register']);
            expect($log.warn).toHaveBeenCalledWith(['No accounts to register']);
          });
        });
      });
    });
  });

  describe('delay script tag', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.delayScriptTag(true);
    }));

    it('should have a truthy value for Analytics.delayScriptTag', function () {
      inject((Analytics: Analytics, $location: any) => {
        expect(Analytics.configuration.delayScriptTag).toBe(true);
      });
    });

    it('should not inject a script tag', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.log.length).toBe(0);
        expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
      });
    });
  });

  describe('automatically create analytics script tag', function () {
    it('should inject the script tag', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
        expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
      });
    });

    it('should warn and prevent a second attempt to inject a script tag', function () {
      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          Analytics.registerScriptTags();
          expect($log.warn).toHaveBeenCalledWith(['Script tags already created']);
        });
      });
    });
  });

  describe('manually create analytics script tag', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.delayScriptTag(true);
    }));

    it('should inject the script tag', function () {
      inject((Analytics: Analytics, $location: any) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
      });
    });

    it('should warn and prevent a second attempt to inject a script tag', function () {
      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          Analytics.registerScriptTags();
          expect($log.warn).toHaveBeenCalledWith(['Script tags already created']);
        });
      });
    });

    describe('with a prefix set', function(){
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider
          .trackPrefix("test-prefix");
      }));

      it('should send the url, including the prefix', function(){
        inject((Analytics: Analytics) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          Analytics.registerTrackers();
          expect(Analytics.log[2]).toEqual(['send', 'pageview', 'test-prefix']);
        });
      });

      it('should send the url, including the prefix with each event', function() {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; // clear log
            Analytics.trackEvent('test', 'action', 'label', 0);
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', 'action', 'label', 0, { page: 'test-prefix' });
          });
        });
      });
    });
  });

  describe('hybrid mobile application support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider
        .setHybridMobileSupport(true)
        .delayScriptTag(true);
    }));

    it('should support hybridMobileSupport', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.hybridMobileSupport).toBe(true);
      });
    });

    it('should inject a script tag with the HTTPS protocol and set checkProtocolTask to null', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.registerScriptTags();
        Analytics.registerTrackers();
        expect(Analytics.log[0]).toEqual(['inject', 'https://www.google-analytics.com/analytics.js']);
        expect(Analytics.log[1]).toEqual(['create', 'UA-XXXXXX-xx', {}]);
        expect(Analytics.log[2]).toEqual(['set', 'checkProtocolTask', null]);
      });
    });
  });

  describe('account custom set commands support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider
        .setAccount({
          tracker: 'UA-XXXXXX-xx',
          set: {
            forceSSL: true
          }
        })
        .setHybridMobileSupport(true)
        .delayScriptTag(true);
    }));

    it('should set the account object to use forceSSL', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.registerScriptTags();
        Analytics.registerTrackers();
        expect(Analytics.log[0]).toEqual(['inject', 'https://www.google-analytics.com/analytics.js']);
        expect(Analytics.log[1]).toEqual(['create', 'UA-XXXXXX-xx', {}]);
        expect(Analytics.log[2]).toEqual(['set', 'checkProtocolTask', null]);
        expect(Analytics.log[3]).toEqual(['set', 'forceSSL', true]);
      });
    });
  });

  describe('account select support', function () {
    var account;

    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
       account = {
        tracker: 'UA-XXXXXX-xx',
        select: function () {
          return false;
        }
      };
      spyOn(account, 'select');
      AnalyticsProvider.setAccount(account);
    }));

    it('should not run with commands after configuration when select returns false', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.trackPage('/path/to', 'title');
        expect(Analytics.log.length).toEqual(0);
        expect(account.select).toHaveBeenCalledWith(['send', 'pageview', { page: '/path/to', title: 'title' }]);
      });
    });
  });

  describe('ignoreFirstPageLoad configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.ignoreFirstPageLoad(true);
    }));

    it('should support ignoreFirstPageLoad', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.ignoreFirstPageLoad).toBe(true);
      });
    });
  });

  describe('displayFeature configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useDisplayFeatures(true);
    }));

    it('should support displayFeatures config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.displayFeatures).toBe(true);
      });
    });
  });

  describe('enhancedLinkAttribution configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useEnhancedLinkAttribution(true);
    }));

    it('should support enhancedLinkAttribution config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.enhancedLinkAttribution).toBe(true);
      });
    });
  });

  describe('experiment configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.setExperimentId('12345');
    }));

    it('should support experimentId config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.experimentId).toBe('12345');
      });
    });
  });

  describe('supports custom events, dimensions, and metrics', function () {
    it('should allow sending custom events', function () {
      inject((Analytics: Analytics) => {
        var social = {
          hitType: 'social',
          socialNetwork: 'facebook',
          socialAction: 'like',
          socialTarget: 'http://mycoolpage.com',
          page: '/my-new-page'
        };
        Analytics.log.length = 0; // clear log
        Analytics.send(social);
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['send', social]);
      });
    });

    it('should allow setting custom dimensions, metrics or experiment', function () {
      inject((Analytics: Analytics) => {
        var data = {
          name: 'dimension1',
          value: 'value1'
        };
        Analytics.log.length = 0; // clear log
        Analytics.set(data.name, data.value);
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['set', data.name, data.value]);
      });
    });

    describe('with eventTracks', function () {
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.trackPages(false);
      }));

      it('should generate eventTracks', function () {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; // clear log
            Analytics.trackEvent('test');
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', undefined, undefined, undefined, { page: '' });
          });
        });
      });

      it('should generate eventTracks and honor non-interactions', function () {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; // clear log
            Analytics.trackEvent('test', 'action', 'label', 0, true);
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', 'action', 'label', 0, { nonInteraction: true, page: '' });
          });
        });
      });
    });
  });

  describe('e-commerce transactions with analytics.js', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useECommerce(true);
    }));

    it('should have e-commerce enabled', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.ecommerce).toBe(true);
      });
    });

    it('should have enhanced e-commerce disabled', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.enhancedEcommerce).toBe(false);
      });
    });

    it('should add transcation', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.addTrans('1', '', '2.42', '0.42', '0', 'Amsterdam', '', 'Netherlands');
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0][0]).toEqual('ecommerce:addTransaction');
      });
    });

    it('should add an item to transaction', function () {
      inject((Analytics: Analytics) => {
        Analytics.log length = 0; // clear log
        Analytics.addItem('1', 'sku-1', 'Test product 1', 'Testing', '1', '1');
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0][0]).toEqual('ecommerce:addItem');
      });
    });

    it('should track the transaction', function () {
      inject((Analytics: Analytics) => {
        Analytics.log length = 0; // clear log
        Analytics.trackTrans();
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['ecommerce:send']);
      });
    });

    it('should allow transaction clearing', function () {
      inject((Analytics: Analytics) => {
        Analytics.log length = 0; // clear log
        Analytics.clearTrans();
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['ecommerce:clear']);
      });
    });

    it('should not support enhanced e-commerce commands', function () {
      var commands = [
        'addImpression',
        'addProduct',
        'addPromo',
        'setAction'
      ];

      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          commands.forEach(function (command) {
            Analytics[command]();
            expect($log.warn).toHaveBeenCalledWith(['Enhanced Ecommerce must be enabled to use ' + command + ' with analytics.js']);
          });
        });
      });
    });

    describe('supports multiple tracking objects', function () {
      var trackers = [
        { tracker: 'UA-12345-12', name: 'tracker1', trackEcommerce: true },
        { tracker: 'UA-12345-34', name: 'tracker2', trackEcommerce: false },
        { tracker: 'UA-12345-45', trackEcommerce: true }
      ];

      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.setAccount(trackers);
      }));

      it('should track transactions for configured tracking objects only',```
/* global afterEach, before, beforeEach, describe, document, expect, inject, it, module, spyOn */
'use strict';

import { module, inject } from 'angular';
import { AnalyticsProvider, Analytics } from './analytics'; // Assuming these are defined in a separate file

describe('universal analytics', function () {
  beforeEach(() => module('angular-google-analytics'));
  beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
    AnalyticsProvider
      .setAccount('UA-XXXXXX-xx')
      .useAnalytics(true)
      .logAllCalls(true)
      .enterTestMode();
  }));

  afterEach(inject((Analytics: Analytics) => {
    Analytics.log.length = 0; // clear log
  }));

  describe('required settings missing', function () {
    describe('for analytics script injection', function () {
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.setAccount(undefined);
      }));

      it('should inject a script tag', function () {
        inject((Analytics: Analytics) => {
          expect(Analytics.log.length).toBe(2);
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
        });
      });

      it('should issue a warning to the log', function () {
        inject(($log: any) => {
          spyOn($log, 'warn');
          inject((Analytics: Analytics) => {
            expect(Analytics.log.length).toBe(2);
            expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
            expect(Analytics.log[1]).toEqual(['warn', 'No accounts to register']);
            expect($log.warn).toHaveBeenCalledWith(['No accounts to register']);
          });
        });
      });
    });
  });

  describe('delay script tag', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.delayScriptTag(true);
    }));

    it('should have a truthy value for Analytics.delayScriptTag', function () {
      inject((Analytics: Analytics, $location: any) => {
        expect(Analytics.configuration.delayScriptTag).toBe(true);
      });
    });

    it('should not inject a script tag', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.log.length).toBe(0);
        expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
      });
    });
  });

  describe('automatically create analytics script tag', function () {
    it('should inject the script tag', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
        expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
      });
    });

    it('should warn and prevent a second attempt to inject a script tag', function () {
      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          Analytics.registerScriptTags();
          expect($log.warn).toHaveBeenCalledWith(['Script tags already created']);
        });
      });
    });
  });

  describe('manually create analytics script tag', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.delayScriptTag(true);
    }));

    it('should inject the script tag', function () {
      inject((Analytics: Analytics, $location: any) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
      });
    });

    it('should warn and prevent a second attempt to inject a script tag', function () {
      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          Analytics.registerScriptTags();
          expect($log.warn).toHaveBeenCalledWith(['Script tags already created']);
        });
      });
    });

    describe('with a prefix set', function(){
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider
          .trackPrefix("test-prefix");
      }));

      it('should send the url, including the prefix', function(){
        inject((Analytics: Analytics) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          Analytics.registerTrackers();
          expect(Analytics.log[2]).toEqual(['send', 'pageview', 'test-prefix']);
        });
      });

      it('should send the url, including the prefix with each event', function() {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; // clear log
            Analytics.trackEvent('test', 'action', 'label', 0);
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', 'action', 'label', 0, { page: 'test-prefix' });
          });
        });
      });
    });
  });

  describe('hybrid mobile application support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider
        .setHybridMobileSupport(true)
        .delayScriptTag(true);
    }));

    it('should support hybridMobileSupport', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.hybridMobileSupport).toBe(true);
      });
    });

    it('should inject a script tag with the HTTPS protocol and set checkProtocolTask to null', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.registerScriptTags();
        Analytics.registerTrackers();
        expect(Analytics.log[0]).toEqual(['inject', 'https://www.google-analytics.com/analytics.js']);
        expect(Analytics.log[1]).toEqual(['create', 'UA-XXXXXX-xx', {}]);
        expect(Analytics.log[2]).toEqual(['set', 'checkProtocolTask', null]);
      });
    });
  });

  describe('account custom set commands support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider
        .setAccount({
          tracker: 'UA-XXXXXX-xx',
          set: {
            forceSSL: true
          }
        })
        .setHybridMobileSupport(true)
        .delayScriptTag(true);
    }));

    it('should set the account object to use forceSSL', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.registerScriptTags();
        Analytics.registerTrackers();
        expect(Analytics.log[0]).toEqual(['inject', 'https://www.google-analytics.com/analytics.js']);
        expect(Analytics.log[1]).toEqual(['create', 'UA-XXXXXX-xx', {}]);
        expect(Analytics.log[2]).toEqual(['set', 'checkProtocolTask', null]);
        expect(Analytics.log[3]).toEqual(['set', 'forceSSL', true]);
      });
    });
  });

  describe('account select support', function () {
    var account;

    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
       account = {
        tracker: 'UA-XXXXXX-xx',
        select: function () {
          return false;
        }
      };
      spyOn(account, 'select');
      AnalyticsProvider.setAccount(account);
    }));

    it('should not run with commands after configuration when select returns false', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.trackPage('/path/to', 'title');
        expect(Analytics.log.length).toEqual(0);
        expect(account.select).toHaveBeenCalledWith(['send', 'pageview', { page: '/path/to', title: 'title' }]);
      });
    });
  });

  describe('ignoreFirstPageLoad configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.ignoreFirstPageLoad(true);
    }));

    it('should support ignoreFirstPageLoad', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.ignoreFirstPageLoad).toBe(true);
      });
    });
  });

  describe('displayFeature configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useDisplayFeatures(true);
    }));

    it('should support displayFeatures config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.displayFeatures).toBe(true);
      });
    });
  });

  describe('enhancedLinkAttribution configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useEnhancedLinkAttribution(true);
    }));

    it('should support enhancedLinkAttribution config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.enhancedLinkAttribution).toBe(true);
      });
    });
  });

  describe('experiment configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.setExperimentId('12345');
    }));

    it('should support experimentId config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.experimentId).toBe('12345');
      });
    });
  });

  describe('supports custom events, dimensions, and metrics', function () {
    it('should allow sending custom events', function () {
      inject((Analytics: Analytics) => {
        var social = {
          hitType: 'social',
          socialNetwork: 'facebook',
          socialAction: 'like',
          socialTarget: 'http://mycoolpage.com',
          page: '/my-new-page'
        };
        Analytics.log.length = 0; // clear log
        Analytics.send(social);
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['send', social]);
      });
    });

    it('should allow setting custom dimensions, metrics or experiment', function () {
      inject((Analytics: Analytics) => {
        var data = {
          name: 'dimension1',
          value: 'value1'
        };
        Analytics.log.length = 0; // clear log
        Analytics.set(data.name, data.value);
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['set', data.name, data.value]);
      });
    });

    describe('with eventTracks', function () {
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.trackPages(false);
      }));

      it('should generate eventTracks', function () {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; // clear log
            Analytics.trackEvent('test');
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', undefined, undefined, undefined, { page: '' });
          });
        });
      });

      it('should generate eventTracks and honor non-interactions', function () {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; // clear log
            Analytics.trackEvent('test', 'action', 'label', 0, true);
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', 'action', 'label', 0, { nonInteraction: true, page: '' });
          });
        });
      });
    });
  });

  describe('e-commerce transactions with analytics.js', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useECommerce(true);
    }));

    it('should have e-commerce enabled', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.ecommerce).toBe(true);
      });
    });

    it('should have enhanced e-commerce disabled', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.enhancedEcommerce).toBe(false);
      });
    });

    it('should add transcation', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.addTrans('1', '', '2.42', '0.42', '0', 'Amsterdam', '', 'Netherlands');
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0][0]).toEqual('ecommerce:addTransaction');
      });
    });

    it('should add an item to transaction', function () {
      inject((Analytics: Analytics) => {
        Analytics.log length = 0; // clear log
        Analytics.addItem('1', 'sku-1', 'Test product 1', 'Testing', '1', '1');
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0][0]).toEqual('ecommerce:addItem');
      });
    });

    it('should track the transaction', function () {
      inject((Analytics: Analytics) => {
        Analytics.log length = 0; // clear log
        Analytics.trackTrans();
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['ecommerce:send']);
      });
    });

    it('should allow transaction clearing', function () {
      inject((Analytics: Analytics) => {
        Analytics.log length = 0; // clear log
        Analytics.clearTrans();
        expect(Analytics.log.length).toBe(1;
        expect(Analytics.log[0]).toEqual(['ecommerce:clear']);
      });
    });

    it('should not support enhanced e-commerce commands', function () {
      var commands = [
        'addImpression',
        'addProduct',
        'addPromo',
        'setAction'
      ];

      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          commands.forEach(function (command) {
            Analytics[command]();
            expect($log.warn).toHaveBeenCalledWith(['Enhanced Ecommerce must be enabled to use ' + command + ' with analytics.js']);
          });
        });
      });
    });

    describe('supports multiple tracking objects', function () {
      var trackers = [
        { tracker: 'UA-12345-12', name: 'tracker1', trackEcommerce: true },
        { tracker: 'UA-12345-34', name: 'tracker2', trackEcommerce: false },
        { tracker: 'UA-12345-45', trackEcommerce: true }
      ];

      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.setAccount(trackers);
      }));

      it('should track transactions for configured tracking objects```
/* global afterEach, before, beforeEach, describe, document, expect, inject, it, module, spyOn */
'use strict';

import { module, inject } from 'angular';
import { AnalyticsProvider, Analytics } from './analytics'; // Assuming these are defined in a separate file

describe('universal analytics', function () {
  beforeEach(() => module('angular-google-analytics'));
  beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
    AnalyticsProvider
      .setAccount('UA-XXXXXX-xx')
      .useAnalytics(true)
      .logAllCalls(true)
      .enterTestMode();
  }));

  afterEach(inject((Analytics: Analytics) => {
    Analytics.log.length = 0; // clear log
  }));

  describe('required settings missing', function () {
    describe('for analytics script injection', function () {
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.setAccount(undefined);
      }));

      it('should inject a script tag', function () {
        inject((Analytics: Analytics) => {
          expect(Analytics.log.length).toBe(2);
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
        });
      });

      it('should issue a warning to the log', function () {
        inject(($log: any) => {
          spyOn($log, 'warn');
          inject((Analytics: Analytics) => {
            expect(Analytics.log.length).toBe(2);
            expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
            expect(Analytics.log[1]).toEqual(['warn', 'No accounts to register']);
            expect($log.warn).toHaveBeenCalledWith(['No accounts to register']);
          });
        });
      });
    });
  });

  describe('delay script tag', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.delayScriptTag(true);
    }));

    it('should have a truthy value for Analytics.delayScriptTag', function () {
      inject((Analytics: Analytics, $location: any) => {
        expect(Analytics.configuration.delayScriptTag).toBe(true);
      });
    });

    it('should not inject a script tag', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.log.length).toBe(0);
        expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
      });
    });
  });

  describe('automatically create analytics script tag', function () {
    it('should inject the script tag', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
        expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
      });
    });

    it('should warn and prevent a second attempt to inject a script tag', function () {
      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          Analytics.registerScriptTags();
          expect($log.warn).toHaveBeenCalledWith(['Script tags already created']);
        });
      });
    });
  });

  describe('manually create analytics script tag', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.delayScriptTag(true);
    }));

    it('should inject the script tag', function () {
      inject((Analytics: Analytics, $location: any) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
      });
    });

    it('should warn and prevent a second attempt to inject a script tag', function () {
      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          Analytics.registerScriptTags();
          expect($log.warn).toHaveBeenCalledWith(['Script tags already created']);
        });
      });
    });

    describe('with a prefix set', function(){
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider
          .trackPrefix("test-prefix");
      }));

      it('should send the url, including the prefix', function(){
        inject((Analytics: Analytics) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          Analytics.registerTrackers();
          expect(Analytics.log[2]).toEqual(['send', 'pageview', 'test-prefix']);
        });
      });

      it('should send the url, including the prefix with each event', function() {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; // clear log
            Analytics.trackEvent('test', 'action', 'label', 0);
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', 'action', 'label', 0, { page: 'test-prefix' });
          });
        });
      });
    });
  });

  describe('hybrid mobile application support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider
        .setHybridMobileSupport(true)
        .delayScriptTag(true);
    }));

    it('should support hybridMobileSupport', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.hybridMobileSupport).toBe(true);
      });
    });

    it('should inject a script tag with the HTTPS protocol and set checkProtocolTask to null', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.registerScriptTags();
        Analytics.registerTrackers();
        expect(Analytics.log[0]).toEqual(['inject', 'https://www.google-analytics.com/analytics.js']);
        expect(Analytics.log[1]).toEqual(['create', 'UA-XXXXXX-xx', {}]);
        expect(Analytics.log[2]).toEqual(['set', 'checkProtocolTask', null]);
      });
    });
  });

  describe('account custom set commands support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider
        .setAccount({
          tracker: 'UA-XXXXXX-xx',
          set: {
            forceSSL: true
          }
        })
        .setHybridMobileSupport(true)
        .delayScriptTag(true);
    }));

    it('should set the account object to use forceSSL', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.registerScriptTags();
        Analytics.registerTrackers();
        expect(Analytics.log[0]).toEqual(['inject', 'https://www.google-analytics.com/analytics.js']);
        expect(Analytics.log[1]).toEqual(['create', 'UA-XXXXXX-xx', {}]);
        expect(Analytics.log[2]).toEqual(['set', 'checkProtocolTask', null]);
        expect(Analytics.log[3]).toEqual(['set', 'forceSSL', true]);
      });
    });
  });

  describe('account select support', function () {
    var account;

    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
       account = {
        tracker: 'UA-XXXXXX-xx',
        select: function () {
          return false;
        }
      };
      spyOn(account, 'select');
      AnalyticsProvider.setAccount(account);
    }));

    it('should not run with commands after configuration when select returns false', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.trackPage('/path/to', 'title');
        expect(Analytics.log.length).toEqual(0);
        expect(account.select).toHaveBeenCalledWith(['send', 'pageview', { page: '/path/to', title: 'title' }]);
      });
    });
  });

  describe('ignoreFirstPageLoad configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.ignoreFirstPageLoad(true);
    }));

    it('should support ignoreFirstPageLoad', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.ignoreFirstPageLoad).toBe(true);
      });
    });
  });

  describe('displayFeature configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useDisplayFeatures(true);
    }));

    it('should support displayFeatures config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.displayFeatures).toBe(true);
      });
    });
  });

  describe('enhancedLinkAttribution configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useEnhancedLinkAttribution(true);
    }));

    it('should support enhancedLinkAttribution config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.enhancedLinkAttribution).toBe(true);
      });
    });
  });

  describe('experiment configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.setExperimentId('12345');
    }));

    it('should support experimentId config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.experimentId).toBe('12345');
      });
    });
  });

  describe('supports custom events, dimensions, and metrics', function () {
    it('should allow sending custom events', function () {
      inject((Analytics: Analytics) => {
        var social = {
          hitType: 'social',
          socialNetwork: 'facebook',
          socialAction: 'like',
          socialTarget: 'http://mycoolpage.com',
          page: '/my-new-page'
        };
        Analytics.log.length = 0; // clear log
        Analytics.send(social);
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['send', social]);
      });
    });

    it('should allow setting custom dimensions, metrics or experiment', function () {
      inject((Analytics: Analytics) => {
        var data = {
          name: 'dimension1',
          value: 'value1'
        };
        Analytics.log.length = 0; // clear log
        Analytics.set(data.name, data.value);
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['set', data.name, data.value]);
      });
    });

    describe('with eventTracks', function () {
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.trackPages(false);
      }));

      it('should generate eventTracks', function () {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; // clear log
            Analytics.trackEvent('test');
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', undefined, undefined, undefined, { page: '' });
          });
        });
      });

      it('should generate eventTracks and honor non-interactions', function () {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; // clear log
            Analytics.trackEvent('test', 'action', 'label', 0, true);
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', 'action', 'label', 0, { nonInteraction: true, page: '' });
          });
        });
      });
    });
  });

  describe('e-commerce transactions with analytics.js', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useECommerce(true);
    }));

    it('should have e-commerce enabled', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.ecommerce).toBe(true);
      });
    });

    it('should have enhanced e-commerce disabled', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.enhancedEcommerce).toBe(false);
      });
    });

    it('should add transcation', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.addTrans('1', '', '2.42', '0.42', '0', 'Amsterdam', '', 'Netherlands');
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0][0]).toEqual('ecommerce:addTransaction');
      });
    });

    it('should add an item to transaction', function () {
      inject((Analytics: Analytics) => {
        Analytics.log length = 0; // clear log
        Analytics.addItem('1', 'sku-1', 'Test product 1', 'Testing', '1', '1');
        expect(Analytics.log.length).toBe(1;
        expect(Analytics.log[0][0]).toEqual('ecommerce:addItem');
      });
    });

    it('should track the transaction', function () {
      inject((Analytics: Analytics) => {
        Analytics.log length = 0; // clear log
        Analytics.trackTrans();
        expect(Analytics.log.length).toBe(1;
        expect(Analytics.log[0]).toEqual(['ecommerce:send']);
      });
    });

    it('should allow transaction clearing', function () {
      inject((Analytics: Analytics) => {
        Analytics.log length = 0; // clear log
        Analytics.clearTrans();
        expect(Analytics.log.length).toBe(1;
        expect(Analytics.log[0]).toEqual(['ecommerce:clear']);
      });
    });

    it('should not support enhanced e-commerce commands', function () {
      var commands = [
        'addImpression',
        'addProduct',
        'addPromo',
        'setAction'
      ];

      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          commands.forEach(function (command) {
            Analytics[command]();
            expect($log.warn).toHaveBeenCalledWith(['Enhanced Ecommerce must be enabled to use ' + command + ' with analytics.js']);
          });
        });
      });
    });

    describe('supports multiple tracking objects', function () {
      var trackers = [
        { tracker: 'UA-12345-12', name: 'tracker1', trackEcommerce: true },
        { tracker: 'UA-12345-34', name: 'tracker2', trackEcommerce: false },
        { tracker: 'UA-12345-45', trackEcommerce: true }
      ];

      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.setAccount(trackers);
      }));

      it('should track transactions for configured tracking objects only',```
/* global afterEach, before, beforeEach, describe, document, expect, inject, it, module, spyOn */
'use strict';

import { module, inject } from 'angular';
import { AnalyticsProvider, Analytics } from './analytics'; // Assuming these are defined in a separate file

describe('universal analytics', function () {
  beforeEach(() => module('angular-google-analytics'));
  beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
    AnalyticsProvider
      .setAccount('UA-XXXXXX-xx')
      .useAnalytics(true)
      .logAllCalls(true)
      .enterTestMode();
  }));

  afterEach(inject((Analytics: Analytics) => {
    Analytics.log.length = 0; // clear log
  }));

  describe('required settings missing', function () {
    describe('for analytics script injection', function () {
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.setAccount(undefined);
      }));

      it('should inject a script tag', function () {
        inject((Analytics: Analytics) => {
          expect(Analytics.log.length).toBe(2);
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
        });
      });

      it('should issue a warning to the log', function () {
        inject(($log: any) => {
          spyOn($log, 'warn');
          inject((Analytics: Analytics) => {
            expect(Analytics.log.length).toBe(2);
            expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
            expect(Analytics.log[1]).toEqual(['warn', 'No accounts to register']);
            expect($log.warn).toHaveBeenCalledWith(['No accounts to register']);
          });
        });
      });
    });
  });

  describe('delay script tag', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.delayScriptTag(true);
    }));

    it('should have a truthy value for Analytics.delayScriptTag', function () {
      inject((Analytics: Analytics, $location: any) => {
        expect(Analytics.configuration.delayScriptTag).toBe(true);
      });
    });

    it('should not inject a script tag', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.log.length).toBe(0);
        expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
      });
    });
  });

  describe('automatically create analytics script tag', function () {
    it('should inject the script tag', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
        expect(document.querySelectorAll('script[src="//www.google-analytics.com/analytics.js"]').length).toBe(0);
      });
    });

    it('should warn and prevent a second attempt to inject a script tag', function () {
      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          Analytics.registerScriptTags();
          expect($log.warn).toHaveBeenCalledWith(['Script tags already created']);
        });
      });
    });
  });

  describe('manually create analytics script tag', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.delayScriptTag(true);
    }));

    it('should inject the script tag', function () {
      inject((Analytics: Analytics, $location: any) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
      });
    });

    it('should warn and prevent a second attempt to inject a script tag', function () {
      inject(($log: any) => {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          expect(Analytics.log[0]).toEqual(['inject', '//www.google-analytics.com/analytics.js']);
          Analytics.registerScriptTags();
          expect($log.warn).toHaveBeenCalledWith(['Script tags already created']);
        });
      });
    });

    describe('with a prefix set', function(){
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider
          .trackPrefix("test-prefix");
      }));

      it('should send the url, including the prefix', function(){
        inject((Analytics: Analytics) => {
          Analytics.log.length = 0; // clear log
          Analytics.registerScriptTags();
          Analytics.registerTrackers();
          expect(Analytics.log[2]).toEqual(['send', 'pageview', 'test-prefix']);
        });
      });

      it('should send the url, including the prefix with each event', function() {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; // clear log
            Analytics.trackEvent('test', 'action', 'label', 0);
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', 'action', 'label', 0, { page: 'test-prefix' });
          });
        });
      });
    });
  });

  describe('hybrid mobile application support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider
        .setHybridMobileSupport(true)
        .delayScriptTag(true);
    }));

    it('should support hybridMobileSupport', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.hybridMobileSupport).toBe(true);
      });
    });

    it('should inject a script tag with the HTTPS protocol and set checkProtocolTask to null', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.registerScriptTags();
        Analytics.registerTrackers();
        expect(Analytics.log[0]).toEqual(['inject', 'https://www.google-analytics.com/analytics.js']);
        expect(Analytics.log[1]).toEqual(['create', 'UA-XXXXXX-xx', {}]);
        expect(Analytics.log[2]).toEqual(['set', 'checkProtocolTask', null]);
      });
    });
  });

  describe('account custom set commands support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider
        .setAccount({
          tracker: 'UA-XXXXXX-xx',
          set: {
            forceSSL: true
          }
        })
        .setHybridMobileSupport(true)
        .delayScriptTag(true);
    }));

    it('should set the account object to use forceSSL', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.registerScriptTags();
        Analytics.registerTrackers();
        expect(Analytics.log[0]).toEqual(['inject', 'https://www.google-analytics.com/analytics.js']);
        expect(Analytics.log[1]).toEqual(['create', 'UA-XXXXXX-xx', {}]);
        expect(Analytics.log[2]).toEqual(['set', 'checkProtocolTask', null]);
        expect(Analytics.log[3]).toEqual(['set', 'forceSSL', true]);
      });
    });
  });

  describe('account select support', function () {
    var account;

    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
       account = {
        tracker: 'UA-XXXXXX-xx',
        select: function () {
          return false;
        }
      };
      spyOn(account, 'select');
      AnalyticsProvider.setAccount(account);
    }));

    it('should not run with commands after configuration when select returns false', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.trackPage('/path/to', 'title');
        expect(Analytics.log.length).toEqual(0);
        expect(account.select).toHaveBeenCalledWith(['send', 'pageview', { page: '/path/to', title: 'title' }]);
      });
    });
  });

  describe('ignoreFirstPageLoad configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.ignoreFirstPageLoad(true);
    }));

    it('should support ignoreFirstPageLoad', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.ignoreFirstPageLoad).toBe(true);
      });
    });
  });

  describe('displayFeature configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useDisplayFeatures(true);
    }));

    it('should support displayFeatures config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.displayFeatures).toBe(true);
      });
    });
  });

  describe('enhancedLinkAttribution configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useEnhancedLinkAttribution(true);
    }));

    it('should support enhancedLinkAttribution config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.enhancedLinkAttribution).toBe(true);
      });
    });
  });

  describe('experiment configuration support', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.setExperimentId('12345');
    }));

    it('should support experimentId config', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.experimentId).toBe('12345');
      });
    });
  });

  describe('supports custom events, dimensions, and metrics', function () {
    it('should allow sending custom events', function () {
      inject((Analytics: Analytics) => {
        var social = {
          hitType: 'social',
          socialNetwork: 'facebook',
          socialAction: 'like',
          socialTarget: 'http://mycoolpage.com',
          page: '/my-new-page'
        };
        Analytics.log.length = 0; // clear log
        Analytics.send(social);
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['send', social]);
      });
    });

    it('should allow setting custom dimensions, metrics or experiment', function () {
      inject((Analytics: Analytics) => {
        var data = {
          name: 'dimension1',
          value: 'value1'
        };
        Analytics.log.length = 0; // clear log
        Analytics.set(data.name, data.value);
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0]).toEqual(['set', data.name, data.value]);
      });
    });

    describe('with eventTracks', function () {
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.trackPages(false);
      }));

      it('should generate eventTracks', function () {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; // clear log
            Analytics.trackEvent('test');
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', undefined, undefined, undefined, { page: '' });
          });
        });
      });

      it('should generate eventTracks and honor non-interactions', function () {
        inject(($window: any) => {
          spyOn($window, 'ga');
          inject((Analytics: Analytics) => {
            Analytics.log.length = 0; – clear log
            Analytics.trackEvent('test', 'action', 'label', 0, true);
            expect(Analytics.log.length).toBe(1);
            expect($window.ga).toHaveBeenCalledWith('send', 'event', 'test', 'action', 'label', 0, { nonInteraction: true, page: '' });
          });
        });
      });
    });
  });

  describe('e-commerce transactions with analytics.js', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useECommerce(true);
    }));

    it('should have e-commerce enabled', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.ecommerce).toBe(true);
      });
    });

    it('should have enhanced e-commerce disabled', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.enhancedEcommerce).toBe(false);
      });
    });

    it('should add transcation', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; – clear log
        Analytics.addTrans('1', '', '2.42', '0.42', '0', 'Amsterdam', '', 'Netherlands');
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0][0]).toEqual('ecommerce:addTransaction');
      });
    });

    it('should add an item to transaction', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; – clear log
        Analytics.addItem('1', 'sku-1', 'Test product 1', 'Testing', '1', '1');
        expect(Analytics.log.length).toBe(1);
        expect(Analytics.log[0][0]).toEqual('ecommerce:addItem');
      });
    });

    it('should track the transaction', function () {
      inject((Analytics: Analytics) => {
        Analytics.log length = 0; – clear log
        Analytics.trackTrans();
        expect(Analytics.log.length).toBe(1;
        expect(Analytics.log[0]).toEqual(['ecommerce:send']);
      });
    });

    it('should allow transaction clearing', function () {
      inject((Analytics: Analytics) – {
        Analytics.log length = 0; – clear log
        Analytics.clearTrans();
        expect(Analytics.log.length).toBe(1;
        expect(Analytics.log[0]).toEqual(['ecommerce:clear']);
      });
    });

    it('should not support enhanced e-commerce commands', function () {
      var commands = [
        'addImpression',
        'addProduct',
        'addPromo',
        'setAction'
      ];

      inject(($log: any) – {
        spyOn($log, 'warn');
        inject((Analytics: Analytics) – {
          commands.forEach(function (command) {
            Analytics[command]();
            expect($log.warn).toHaveBeenCalledWith(['Enhanced Ecommerce must be enabled to use ' + command + ' with analytics.js']);
          });
        });
      });
    });

    describe('supports multiple tracking objects', function () {
      var trackers = [
        { tracker: 'UA-12345-12', name: 'tracker1', trackEcommerce: true },
        { tracker: 'UA-12345-34', name: 'tracker2', trackEcommerce: false },
        { tracker: 'UA-12345-45', trackEcommerce: true }
      ];

      beforeEach(() – module((AnalyticsProvider: AnalyticsProvider) – {
        AnalyticsProvider.setAccount(trackers);
      }));

      it('should track transactions for configured tracking objects only',```