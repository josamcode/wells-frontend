// Debug mode - disabled in production for performance
export const DEBUG = process.env.NODE_ENV !== 'production' && process.env.REACT_APP_DEBUG === 'true';

// Safe console.log wrapper that only logs in debug mode
export const debugLog = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

// Performance measurement helper
export const measurePerformance = (label, fn) => {
  if (!DEBUG) return fn();

  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
  return result;
};
