/* global before, beforeEach, describe, document, expect, inject, it, module, spyOn */
import { module, inject } from 'angular';
import { AnalyticsProvider, Analytics } from './analytics'; // Assuming these are defined in a separate file
import { Component, OnInit } from '@angular/core';
import { triggerHandler } from '@angular/core'; // Assuming a method to simulate events
@Component({
  selector: 'app-directives',
  templateUrl: './directives.component.html',
  styleUrls: ['./directives.component.css']
})
class DirectivesComponent implements OnInit {
  constructor(private analytics: Analytics) {}
  ngOnInit(): void {
    describe('directives', () => {
      beforeEach(() => {
        module('angular-google-analytics');
        module((AnalyticsProvider: AnalyticsProvider) => {
          AnalyticsProvider
            .setAccount('UA-XXXXXX-xx')
            .logAllCalls(true)
            .enterTestMode();
        });
        describe('gaTrackEvent', () => {
          it('should evaluate scope params', inject((Analytics: Analytics, $rootScope: any, $compile: any) => {
            spyOn(Analytics, 'trackEvent');
            let scope = $rootScope.$new(),
                element = '<div ga-track-event="[event, action, label]">test</div>',
                compiled = $compile(element)(scope);
            scope.event = 'button';
            scope.action = 'click';
            scope.label = 'Some Button';
            scope.$digest();
            compiled.triggerHandler('click');
            expect(Analytics.trackEvent).toHaveBeenCalledWith('button', 'click', 'Some Button');
          }));
          it('should track an event when clicked', inject((Analytics: Analytics, $rootScope: any, $compile: any) => {
            spyOn(Analytics, 'trackEvent');
            let scope = $rootScope.$new(),
                element = '<div ga-track-event="[\'button\', \'click\', \'Some Button\']">test</div>',
                compiled = $compile(element)(scope);
            scope.$digest();
            compiled.triggerHandler('click');
            expect(Analytics.trackEvent).toHaveBeenCalledWith('button', 'click', 'Some Button');
          }));
          it('should inherit parent scope', inject((Analytics: Analytics, $rootScope: any, $compile: any) => {
            spyOn(Analytics, 'trackEvent');
            let scope = $rootScope.$new(), element, compiled;
            scope.event = ['button', 'click', 'Some Button'];
            element = '<div ga-track-event="event">test</div>';
            compiled = $compile(element)(scope);
            scope.$digest();
            compiled.triggerHandler('click');
            expect(Analytics.trackEvent).toHaveBeenCalledWith('button', 'click', 'Some Button');
          }));
          it('should abort if gaTrackEventIf is false', inject((Analytics: Analytics, $rootScope: any, $compile: any) => {
            spyOn(Analytics, 'trackEvent');
            let scope = $rootScope.$new(),
                element = '<div ga-track-event="[\'button\', \'click\', \'Some Button\']" ga-track-event-if="false">test</div>',
                compiled = $compile(element)(scope);
            scope.$digest();
            compiled.triggerHandler('click');
            expect(Analytics.trackEvent.calls.count()).toBe(0);
            element = '<div ga-track-event="[\'button\', \'click\', \'Some Button\']" ga-track-event-if="true">test</div>';
            compiled = $compile(element)(scope);
            scope.$digest();
            compiled.triggerHandler('click');
            expect(Analytics.trackEvent.calls.count()).toBe(1);
          });
        });
      });
    });
  }
}