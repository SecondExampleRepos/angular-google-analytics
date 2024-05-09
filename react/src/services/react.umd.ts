import { act } from 'react-dom/test-utils';
import { getQueriesForElement, prettyDOM, logDOM, fireEvent, configure, within, waitFor, buildQueries, queries, screen, render, cleanup, createEvent } from '@testing-library/react';
import { getDefaultNormalizer } from '@testing-library/dom';
import { computeAccessibleName, computeAccessibleDescription } from 'dom-accessibility-api';

function renderWithAct(ui, options) {
  let container;
  act(() => {
    const result = render(ui, options);
    container = result.container;
  });
  return getQueriesForElement(container);
}

function renderHookWithAct(hook, options) {
  let result;
  act(() => {
    result = renderHook(hook, options);
  });
  return result;
}

function fireEventWithAct(element, event) {
  act(() => {
    fireEvent(element, event);
  });
}

function waitForWithAct(callback, options) {
  return waitFor(() => {
    let result;
    act(() => {
      result = callback();
    });
    return result;
  }, options);
}

export {
  renderWithAct as render,
  renderHookWithAct as renderHook,
  fireEventWithAct as fireEvent,
  waitForWithAct as waitFor,
  getQueriesForElement,
  prettyDOM,
  logDOM,
  configure,
  within,
  buildQueries,
  queries,
  screen,
  cleanup,
  createEvent,
  getDefaultNormalizer,
  computeAccessibleName,
  computeAccessibleDescription
};