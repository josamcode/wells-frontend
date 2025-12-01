/**
 * Debug utilities for development
 */

// Import React for useDebug hook
import React from 'react';

// Enable debug mode flag
export const DEBUG = process.env.NODE_ENV === 'development';

/**
 * Log component render with details
 */
export const logRender = (componentName, props = {}) => {
  if (DEBUG) {
    console.log(`🔄 [RENDER] ${componentName}`, props);
  }
};

/**
 * Log component mount
 */
export const logMount = (componentName) => {
  if (DEBUG) {
    console.log(`✅ [MOUNT] ${componentName}`);
  }
};

/**
 * Log component unmount
 */
export const logUnmount = (componentName) => {
  if (DEBUG) {
    console.log(`❌ [UNMOUNT] ${componentName}`);
  }
};

/**
 * Log API call
 */
export const logAPI = (method, url, data = null) => {
  if (DEBUG) {
    console.group(`🌐 [API] ${method.toUpperCase()} ${url}`);
    if (data) {
      console.log('Data:', data);
    }
    console.groupEnd();
  }
};

/**
 * Log error with context
 */
export const logError = (context, error, additionalInfo = {}) => {
  console.group(`🚨 [ERROR] ${context}`);
  console.error('Error:', error);
  console.error('Message:', error?.message);
  console.error('Stack:', error?.stack);
  if (Object.keys(additionalInfo).length > 0) {
    console.error('Additional Info:', additionalInfo);
  }
  console.groupEnd();
};

/**
 * Log warning
 */
export const logWarning = (message, data = null) => {
  if (DEBUG) {
    console.warn(`⚠️ [WARNING] ${message}`, data || '');
  }
};

/**
 * Validate component export
 */
export const validateComponent = (component, componentName) => {
  if (!component) {
    logError(`Component Validation: ${componentName}`, new Error('Component is undefined or null'));
    return false;
  }

  if (typeof component !== 'function' && typeof component !== 'object') {
    logError(`Component Validation: ${componentName}`, new Error(`Component is not a valid React component. Type: ${typeof component}`));
    return false;
  }

  return true;
};

/**
 * Validate icon import
 * React components can be functions or forward ref objects
 */
export const validateIcon = (icon, iconName) => {
  if (!icon) {
    logError(`Icon Validation: ${iconName}`, new Error('Icon is undefined or null'));
    return false;
  }

  // Check if it's a function (regular component)
  if (typeof icon === 'function') {
    return true;
  }

  // Check if it's a React forward ref component (object with $$typeof)
  if (typeof icon === 'object' && icon !== null) {
    // React forward ref components have $$typeof: Symbol(react.forward_ref)
    if (icon.$$typeof || icon.render) {
      return true;
    }
  }

  // If it's neither, it's invalid
  logError(`Icon Validation: ${iconName}`, new Error(`Icon is not a valid React component. Type: ${typeof icon}, Value: ${JSON.stringify(icon)}`));
  return false;
};

/**
 * Debug hook to track component lifecycle
 */
export const useDebug = (componentName) => {
  // Always call hooks - make logic inside conditional
  React.useEffect(() => {
    if (DEBUG) {
      logMount(componentName);
    }
    return () => {
      if (DEBUG) {
        logUnmount(componentName);
      }
    };
  }, [componentName]);

  React.useEffect(() => {
    if (DEBUG) {
      logRender(componentName);
    }
  });
};


