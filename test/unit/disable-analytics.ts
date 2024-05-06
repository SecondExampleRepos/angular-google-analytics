/* global afterEach, before, beforeEach, describe, document, expect, inject, it, module, spyOn */
import { module, inject } from 'angular';
import { AnalyticsProvider, Analytics } from './types'; // Assuming types are defined in types.ts
'use strict';

describe('disable analytics / user opt-out', function () {
  beforeEach(() => module('angular-google-analytics'));
  beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
    AnalyticsProvider
      .setAccount('UA-XXXXXX-xx')
      .logAllCalls(true)
      .enterTestMode();
  }));

  afterEach(inject((Analytics: Analytics) => {
    Analytics.log.length = 0; // clear log
  }));

  describe('with universal analytics', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useAnalytics(true);
    }));

    it('should be enabled by default', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.disableAnalytics).toBe(false);
      });
    });

    describe('when disabled', function () {
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.disableAnalytics(true);
      }));

      it('should be disabled', function () {
        inject((Analytics: Analytics) => {
          expect(Analytics.configuration.disableAnalytics).toBe(true);
        });
      });

      it('should log an info message about the account being disabled', function () {
        inject((Analytics: Analytics, $window: Window) => {
          expect(Analytics.log[0]).toEqual(['info', 'Analytics disabled: UA-XXXXXX-xx']);
          expect($window['ga-disable-UA-XXXXXX-xx']).toBe(true);
        });
      });
    });
  });

  describe('with classic analytics', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useAnalytics(false);
    }));

    it('should be enabled by default', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.configuration.disableAnalytics).toBe(false);
      });
    });

    describe('when disabled', function () {
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.disableAnalytics(true);
      }));

      it('should be disabled', function () {
        inject((Analytics: Analytics) => {
          expect(Analytics.configuration.disableAnalytics).toBe(true);
        });
      });

      it('should log an info message about the account being disabled', function () {
        inject((Analytics: Analytics, $window: Window) => {
          expect(Analytics.log[0]).toEqual(['info', 'Analytics disabled: UA-XXXXXX-xx']);
          expect($window['ga-disable-UA-XXXXXX-xx']).toBe(true);
        });
      });
    });
  });
});