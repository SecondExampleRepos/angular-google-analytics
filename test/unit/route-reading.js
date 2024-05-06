/* global afterEach, before, beforeEach, describe, document, expect, inject, it, module, spyOn */
import { module, inject } from '@angular/core/testing';
import { AnalyticsService } from './analytics.service'; // Assuming the service is defined in this path
import { LogService } from './log.service'; // Assuming the log service is defined in this path
import { RouteService } from './route.service'; // Assuming the route service is defined in this path
describe('Reading from $route service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnalyticsService, LogService, RouteService]
    });
  });
  beforeEach(() => {
    const analyticsProvider = TestBed.inject(AnalyticsService);
    analyticsProvider
      .setAccount('UA-XXXXXX-xx')
      .logAllCalls(true)
      .enterTestMode();
  });
  afterEach(() => {
    const analytics = TestBed.inject(AnalyticsService);
    analytics.log = []; // clear log
  });
  it('should not activate $route reading', () => {
    const analytics = TestBed.inject(AnalyticsService);
    expect(analytics.configuration.readFromRoute).toBe(false);
  });
  describe('without $route service available', () => {
    beforeEach(() => {
      const analyticsProvider = TestBed.inject(AnalyticsService);
      analyticsProvider.readFromRoute(true);
    });
    it('should log warning if service is missing', () => {
      const log = TestBed.inject(LogService);
      spyOn(log, 'warn');
      const analytics = TestBed.inject(AnalyticsService);
      expect(log.warn).toHaveBeenCalledWith('$route service is not available. Make sure you have included ng-route in your application dependencies.');
    });
  });
  describe('after setting readFromRoute', () => {
    beforeEach(() => {
      const analyticsProvider = TestBed.inject(AnalyticsService);
      const routeProvider = TestBed.inject(RouteService);
      analyticsProvider.readFromRoute(true);
      routeProvider.routes = {
        someroute: { pageTrack: '/some' },
        otherroute: { }
      };
    });
    it('should activate $route reading', () => {
      const analytics = TestBed.inject(AnalyticsService);
      expect(analytics.configuration.readFromRoute).toBe(true);
    });
    it('should read '/someroute' from routes object', () => {
      const analytics = TestBed.inject(AnalyticsService);
      const route = TestBed.inject(RouteService);
      route.current = route.routes.someroute;
      expect(analytics.getUrl()).toBe('/some');
    });
    it('should fallback to url for '/otherroute' without 'pageTrack' property', () => {
      const analytics = TestBed.inject(AnalyticsService);
      const route = TestBed.inject(RouteService);
      const location = TestBed.inject(Location);
      route.current = route.routes.otherroute;
      location.url('/otherroute');
      expect(analytics.getUrl()).toBe('/otherroute');
    });
    it('should fallback to url for '/undefinedroute' which is not present in $route config', () => {
      const analytics = TestBed.inject(AnalyticsService);
      const location = TestBed.inject(Location);
      location.url('/undefinedroute');
      expect(analytics.getUrl()).toBe('/undefinedroute');
    });
  });
  describe('after setting readFromRoute for classic analytics', () => {
    beforeEach(() => {
      const analyticsProvider = TestBed.inject(AnalyticsService);
      const routeProvider = TestBed.inject(RouteService);
      analyticsProvider.readFromRoute(true)
                       .useAnalytics(false);
      routeProvider.routes = {};
    });
    it('should not track undefined routes', () => {
      const analytics = TestBed.inject(AnalyticsService);
      const window = TestBed.inject(Window);
      const rootScope = TestBed.inject(RootScope);
      window._gaq = []; // clear queue
      rootScope.$broadcast('$routeChangeSuccess');
      expect(window._gaq.length).toBe(0);
    });
    it('should not track routes without template', () => {
      const analytics = TestBed.inject(AnalyticsService);
      const window = TestBed.inject(Window);
      const rootScope = TestBed.inject(RootScope);
      const route = TestBed.inject(RouteService);
      route.current = {};
      window._gaq = []; // clear queue
      rootScope.$broadcast('$routeChangeSuccess');
      expect(window._gaq.length).toBe(0);
    });
    it('should not track routes with 'doNotTrack' attribute', () => {
      const analytics = TestBed.inject(AnalyticsService);
      const window = TestBed.inject(Window);
      const rootScope = TestBed.inject(RootScope);
      const route = TestBed.inject(RouteService);
      route.current = { templateUrl: '/myTemplate', doNotTrack: true };
      window._gaq = []; // clear queue
      rootScope.$broadcast('$routeChangeSuccess');
      expect(window._gaq.length).toBe(0);
    });
    it('should track routes with a defined template (no redirect)', () => {
      const analytics = TestBed.inject(AnalyticsService);
      const window = TestBed.inject(Window);
      const rootScope = TestBed.inject(RootScope);
      const route = TestBed.inject(RouteService);
      route.current = { templateUrl: '/myTemplate', pageTrack: '/myTrack' };
      window._gaq = []; // clear queue
      rootScope.$broadcast('$routeChangeSuccess');
      expect(window._gaq.length).toBe(2);
      expect(window._gaq[0]).toEqual(['_set', 'title', '']);
      expect(window._gaq[1]).toEqual(['_trackPageview', '/myTrack']);
    });
  });
  describe('after setting readFromRoute for universal analytics', () => {
    beforeEach(() => {
      const analyticsProvider = TestBed.inject(AnalyticsService);
      const routeProvider = TestBed.inject(RouteService);
      analyticsProvider.readFromRoute(true)
                       .useAnalytics(true);
      routeProvider.routes = {};
    });
    it('should not track undefined routes', () => {
      const analytics = TestBed.inject(AnalyticsService);
      const rootScope = TestBed.inject(RootScope);
      analytics.log = []; // clear queue
      rootScope.$broadcast('$routeChangeSuccess');
      expect(analytics.log.length).toBe(0);
    });
    it('should not track routes without template', () => {
      const analytics = TestBed.inject(AnalyticsService);
      const rootScope = TestBed.inject(RootScope);
      const route = TestBed.inject(RouteService);
      route.current = {};
      analytics.log = []; // clear queue
      rootScope.$broadcast('$routeChangeSuccess');
      expect(analytics.log.length).toBe(0);
    });
    it('should not track routes with 'doNotTrack' attribute', () => {
      const analytics = TestBed.inject(AnalyticsService);
      const rootScope = TestBed.inject(RootScope);
      const route = TestBed.inject(RouteService);
      route.current = { templateUrl: '/myTemplate', doNotTrack: true };
      analytics.log = []; // clear queue
      rootScope.$broadcast('$routeChangeSuccess');
      expect(analytics.log.length).toBe(0);
    });
    it('should track routes with a defined template (no redirect)', () => {
      const analytics = TestBed.inject(AnalyticsService);
      const window = TestBed.inject(Window);
      const rootScope = TestBed.inject(RootScope);
      const route = TestBed.inject(RouteService);
      route.current = { templateUrl: '/myTemplate', pageTrack: '/myTrack' };
      analytics.log = []; // clear queue
      rootScope.$broadcast('$routeChangeSuccess');
      expect(analytics.log.length).toBe(1);
      expect(analytics.log[0]).toEqual(['send', 'pageview', { page: '/myTrack', title: '' }]);
    });
  });
});