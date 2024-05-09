// This is a large JavaScript file that appears to be part of a testing library for React applications.
// It includes utilities for rendering components, firing events, and querying the DOM in tests.
// The code is structured using various imports, utility functions, and configurations for handling DOM events and interactions in a test environment.

// Importing necessary libraries and modules
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { prettyDOM, getQueriesForElement, fireEvent as dtlFireEvent } from '@testing-library/dom';
import { getDefaultNormalizer } from './matches';

// Configuration object for setting default options
const config = {
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 1000,
  eventWrapper: cb => cb(),
  throwSuggestions: false,
};

// Function to configure or update the configuration
function configure(newConfig) {
  if (typeof newConfig === 'function') {
    newConfig = newConfig(config);
  }
  Object.assign(config, newConfig);
}

// Utility function to render a React component into the DOM
function render(ui, { container, baseElement = container, queries, ...options } = {}) {
  if (!baseElement) {
    baseElement = document.body;
  }
  if (!container) {
    container = document.createElement('div');
    baseElement.appendChild(container);
  }

  ReactDOM.render(ui, container);
  const rtlUtils = getQueriesForElement(baseElement, queries);
  return {
    container,
    baseElement,
    ...rtlUtils,
    unmount: () => ReactDOM.unmountComponentAtNode(container),
    rerender: rerenderUi => render(rerenderUi, { container, baseElement, queries }),
  };
}

// Function to unmount and clean up components rendered into the DOM
function cleanup() {
  ReactDOM.unmountComponentAtNode(document.body);
  document.body.innerHTML = '';
}

// Custom fireEvent that wraps the dom-testing-library's fireEvent to include configuration options
const fireEvent = (element, event) => {
  const eventCallback = () => dtlFireEvent(element, event);
  return config.eventWrapper(eventCallback);
};

// Exporting utilities and configurations
export * from '@testing-library/dom';
export { render, cleanup, fireEvent, configure };