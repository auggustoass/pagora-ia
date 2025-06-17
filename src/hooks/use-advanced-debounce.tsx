
import { useState, useEffect, useRef, useCallback } from 'react';

interface AdvancedDebounceOptions {
  delay: number;
  maxWait?: number;
  leading?: boolean;
  trailing?: boolean;
}

export function useAdvancedDebounce<T>(
  value: T,
  options: AdvancedDebounceOptions
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCallTimeRef = useRef<number>(0);
  const lastInvokeTimeRef = useRef<number>(0);

  const { delay, maxWait, leading = false, trailing = true } = options;

  useEffect(() => {
    lastCallTimeRef.current = Date.now();

    const invokeFunc = () => {
      setDebouncedValue(value);
      lastInvokeTimeRef.current = Date.now();
    };

    const shouldInvokeLeading = () => {
      const timeSinceLastInvoke = lastCallTimeRef.current - lastInvokeTimeRef.current;
      return leading && (!lastInvokeTimeRef.current || timeSinceLastInvoke >= delay);
    };

    const remainingWait = () => {
      const timeSinceLastCall = Date.now() - lastCallTimeRef.current;
      const timeSinceLastInvoke = Date.now() - lastInvokeTimeRef.current;
      const timeWaiting = delay - timeSinceLastCall;

      return maxWait !== undefined
        ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting;
    };

    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
    }

    // Invoke immediately if leading
    if (shouldInvokeLeading()) {
      invokeFunc();
      return;
    }

    // Set up trailing timeout
    if (trailing) {
      const wait = remainingWait();
      if (wait <= 0) {
        invokeFunc();
      } else {
        timeoutRef.current = setTimeout(invokeFunc, wait);
      }
    }

    // Set up max wait timeout
    if (maxWait !== undefined && !maxTimeoutRef.current) {
      maxTimeoutRef.current = setTimeout(invokeFunc, maxWait);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, [value, delay, maxWait, leading, trailing]);

  return debouncedValue;
}

export function useAdvancedDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  options: AdvancedDebounceOptions,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // Update callback ref when deps change
  useEffect(() => {
    callbackRef.current = callback;
  }, deps);

  const debouncedCallback = useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, options.delay);
    }) as T,
    [options.delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}
