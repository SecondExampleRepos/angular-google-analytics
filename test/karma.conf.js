// Karma v0.13 http://karma-runner.github.io/0.13/config/configuration-file.html
// See configuration documentation above for CLI arguments
import { ConfigOptions, Config } from 'karma';

const karmaConfig: ConfigOptions = {
  basePath: './..',
  frameworks: ['jasmine'],
  autoWatch: true,
  colors: true,
  files: [
    'node_modules/angular/angular.js',
    'node_modules/angular-mocks/angular-mocks.js',
    'index.js',
    'test/unit/*.js'
  ],
  reporters: ['progress'],
  browsers: ['Chrome'],
  logLevel: Config.LOG_INFO,
  captureTimeout: 5000,
  singleRun: false,
  port: 9876,
  runnerPort: 9100,
  reportSlowerThan: 500
};

export default function(config: Config): void {
  config.set(karmaConfig);
};