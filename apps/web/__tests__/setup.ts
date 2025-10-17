// Global test setup for React components
import { expect } from 'bun:test'

// Setup happy-dom for React component tests
// This provides a DOM environment for testing React components

// Mock window.matchMedia for components that use media queries
global.matchMedia = global.matchMedia || function () {
  return {
    matches: false,
    addListener: function () {},
    removeListener: function () {},
    addEventListener: function () {},
    removeEventListener: function () {},
    dispatchEvent: function () { return true },
  }
}

// Mock IntersectionObserver if needed
global.IntersectionObserver = global.IntersectionObserver || class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return [] }
  unobserve() {}
}

// Mock ResizeObserver if needed
global.ResizeObserver = global.ResizeObserver || class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}