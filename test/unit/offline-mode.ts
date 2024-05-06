/* global afterEach, before, beforeEach, describe, document, expect, inject, it, module, spyOn */
import { module, inject } from 'angular';
import { AnalyticsProvider, Analytics } from './analytics'; // Assuming these are defined in a separate file
import { expect } from 'chai';
describe('offline mode', function () {
  beforeEach(() => module('angular-google-analytics'));
  beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
    AnalyticsProvider
      .setAccount('UA-XXXXXX-xx')
      .logAllCalls(true)
      .enterTestMode();
  }));
  afterEach(() => inject((Analytics: Analytics) => {
    Analytics.log.length = 0; // clear log
  }));
  describe('with universal analytics', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useAnalytics(true);
    }));
    describe('at startup', function () {
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.startOffline(true);
      }));
      it('should have offline set to true', function () {
        inject((Analytics: Analytics) => {
          expect(Analytics.offline()).to.be.true;
        });
      });
      it('should have delay script tag set to true', function () {
        inject((Analytics: Analytics) => {
          expect(Analytics.configuration.delayScriptTag).to.be.true;
        });
      });
      it('should not have sent any commands while offline', function () {
        inject((Analytics: Analytics) => {
          Analytics.trackPage('/page/here');
          expect(Analytics.log.length).to.equal(0);
        });
      });
      it('should send everything when script is added and reset to online', function () {
        inject((Analytics: Analytics, $window: Window) => {
          Analytics.registerScriptTags();
          Analytics.registerTrackers();
          Analytics.offline(false);
          expect(Analytics.log.length).to.equal(3);
          expect(Analytics.log[0]).to.deep.equal(['inject', '//www.google-analytics.com/analytics.js']);
          expect(Analytics.log[1]).to.deep.equal(['create', 'UA-XXXXXX-xx', {}]);
          expect(Analytics.log[2]).to.deep.equal(['send', 'pageview', '']);
        });
      });
    });
    it('should be online by default', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.offline()).to.be.false;
      });
    });
    it('should respect being set to offline', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.offline()).to.be.false;
        Analytics.offline(true);
        expect(Analytics.offline()).to.be.true;
      });
    });
    it('should respect being reset to online', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.offline()).to.be.false;
        Analytics.offline(true);
        expect(Analytics.offline()).to.be.true;
        Analytics.offline(false);
        expect(Analytics.offline()).to.be.false;
      });
    });
    it('should not send any commands while offline', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.offline(true);
        Analytics.trackPage('/page/here');
        expect(Analytics.log.length).to.equal(0);
      });
    });
    it('should send all queued commands when reset to online', function () {
      inject((Analytics: Analytics) => {
        Analytics.log.length = 0; // clear log
        Analytics.offline(true);
        Analytics.trackPage('/page/here');
        expect(Analytics.log.length).to.equal(0);
        Analytics.offline(false);
        expect(Analytics.log.length).to.equal(1);
        expect(Analytics.log[0]).to.deep.equal(['send', 'pageview', { page : '/page/here', title : '' }]);
      });
    });
  });
  describe('with classic analytics', function () {
    beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
      AnalyticsProvider.useAnalytics(false);
    }));
    describe('at startup', function () {
      beforeEach(() => module((AnalyticsProvider: AnalyticsProvider) => {
        AnalyticsProvider.startOffline(true);
      }));
      it('should have offline set to true', function () {
        inject((Analytics: Analytics) => {
          expect(Analytics.offline()).to.be.true;
        });
      });
      it('should have delay script tag set to true', function () {
        inject((Analytics: Analytics) => {
          expect(Analytics.configuration.delayScriptTag).to.be.true;
        });
      });
      it('should not have sent any commands while offline', function () {
        inject((Analytics: Analytics, $window: Window) => {
          $window._gaq.length = 0; // clear queue
          Analytics.trackPage('/page/here');
          expect($window._gaq.length).to.equal(0);
        });
      });
      it('should send everything when script is added and reset to online', function () {
        inject((Analytics: Analytics, $window: Window) => {
          $window._gaq.length = 0; // clear queue
          Analytics.registerScriptTags();
          Analytics.registerTrackers();
          Analytics.offline(false);
          expect(Analytics.log.length).to.equal(3);
          expect(Analytics.log[0]).to.deep.equal(['inject', 'http://www.google-analytics.com/ga.js']);
          expect(Analytics.log[1]).to.deep.equal(['_setAccount', 'UA-XXXXXX-xx']);
          expect(Analytics.log[2]).to.deep.equal(['_trackPageview']);
          expect($window._gaq.length).to.equal(Analytics.log.length - 1);
          expect($window._gaq[0]).to.deep.equal(Analytics.log[1]);
          expect($window._gaq[1]).to.deep.equal(Analytics.log[2]);
        });
      });
    });
    it('should be online by default', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.offline()).to.be.false;
      });
    });
    it('should respect being set to offline', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.offline()).to.be.false;
        Analytics.offline(true);
        expect(Analytics.offline()).to.be.true;
      });
    });
    it('should respect being reset to online', function () {
      inject((Analytics: Analytics) => {
        expect(Analytics.offline()).to.be.false;
        Analytics.offline(true);
        expect(Analytics.offline()).to.be.true;
        Analytics.offline(false);
        expect(Analytics.offline()).to.be.false;
      });
    });
    it('should not send any commands while offline', function () {
      inject((Analytics: Analytics, $window: Window) => {
        $window._gaq.length = 0; // clear queue
        Analytics.offline(true);
        Analytics.trackPage('/page/here');
        expect($window._gaq.length).to.equal(0);
      });
    });
    it('should send all queued commands when reset to online', function () {
      inject((Analytics: Analytics, $window: Window) => {
        Analytics.log.length = 0; // clear log
        $window._gaq.length = 0; // clear queue
        Analytics.offline(true);
        Analytics.trackPage('/page/here');
        expect(Analytics.log.length).to.equal(0);
        expect($window._gaq.length).to.equal(0);
        Analytics.offline(false);
        expect(Analytics.log.length).to.equal(2);
        expect(Analytics.log[0]).to.deep.equal(['_set', 'title', '']);
        expect(Analytics.log[1]).to.deep.equal(['_trackPageview', '/page/here']);
        expect($window._gaq.length).to.equal(Analytics.log.length);
        expect($window._gaq[0]).to.deep.equal(Analytics.log[0]);
        expect($window._gaq[1]).to.deep.equal(Analytics.log[1]);
      });
    });
  });
});