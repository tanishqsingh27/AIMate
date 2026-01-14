/**
 * Debounce hook to optimize form inputs and API calls
 */
import { useState, useCallback } from 'react';

export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useCallback(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttle hook to limit function execution
 */
export const useThrottle = (callback, delay = 300) => {
  const [lastRun, setLastRun] = useState(Date.now());

  const throttled = useCallback(
    (...args) => {
      if (Date.now() - lastRun >= delay) {
        callback(...args);
        setLastRun(Date.now());
      }
    },
    [callback, delay, lastRun]
  );

  return throttled;
};

/**
 * Memoize a function result based on dependencies
 */
export const memoize = (fn, dependencies = []) => {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    
    // Keep cache size limited
    if (cache.size > 50) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  };
};
