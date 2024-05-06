/* global afterEach, before, beforeEach, describe, document, expect, inject, it, module, spyOn */
'use strict';

import { module, inject, afterEach, beforeEach, describe, it } from '@angular/core/testing';
import { AnalyticsService } from './analytics.service'; // Assuming the service is defined in this path

interface Tracker {
  tracker: string;
  name?: string;
  trackEvent?: boolean;
}

describe('universal analytics exception tracking', () => {
  beforeEach(() => {
    module('angular-google-analytics');
    module((AnalyticsProvider: any) => {
      AnalyticsProvider
        .setAccount('UA-XXXXXX-xx')
        .useAnalytics(true)
        .logAllCalls(true)
        .enterTestMode();
    });
  });

  afterEach(inject((Analytics: AnalyticsService) => {
    Analytics.log.length = 0; // clear log
  }));

  it('should have a trackException method', () => {
    inject((Analytics: AnalyticsService) => {
      expect(typeof Analytics.trackException === 'function').toBe(true);
    });
  });

  it('should allow for tracking an exception with no parameters provided', () => {
    inject((Analytics: AnalyticsService) => {
      Analytics.log.length = 0; // clear log
      Analytics.trackException();
      expect(Analytics.log[0]).toEqual(['send', 'exception', { exDescription: undefined, exFatal: false }]);
    });
  });

  it('should allow for tracking an exception with all parameters provided', () => {
    inject((Analytics: AnalyticsService) => {
      Analytics.log.length = 0; // clear log
      Analytics.trackException('Something fatal happened!', true);
      expect(Analytics.log[0]).toEqual(['send', 'exception', { exDescription: 'Something fatal happened!', exFatal: true }]);
    });
  });

  describe('supports tracking for multiple tracking objects', () => {
    const trackers: Tracker[] = [
      { tracker: 'UA-12345-12', name: 'tracker1', trackEvent: true },
      { tracker: 'UA-12345-34', name: 'tracker2' },
      { tracker: 'UA-12345-45', trackEvent: true }
    ];

    beforeEach(() => {
      module((AnalyticsProvider: any) => {
        AnalyticsProvider.setAccount(trackers);
      });
    });

    it('should track exceptions for all objects', () => {
      inject(($window: any) => {
        spyOn($window, 'ga');
        inject((Analytics: AnalyticsService) => {
          Analytics.trackException('Something fatal happened!', true);
          expect($window.ga).toHaveBeenCalledWith('tracker1.send', 'exception', { exDescription: 'Something fatal happened!', exFatal: true });
          expect($window.ga).toHaveBeenCalledWith('tracker2.send', 'exception', { exDescription: 'Something fatal happened!', exFatal: true });
          expect($window.ga).toHaveBeenCalledWith('send', 'exception', { exDescription: 'Something fatal happened!', exFatal: true });
        });
      });
    });
  });
});
