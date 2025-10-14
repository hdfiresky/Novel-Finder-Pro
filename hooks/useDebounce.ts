

import { useState, useEffect } from 'react';

/**
 * A custom hook that debounces a value. It only reflects the latest value
 * after a specified delay has passed without any new changes.
 * This is useful for performance-intensive operations that shouldn't run
 * on every keystroke, such as API calls or heavy computations based on user input.
 * @template T The type of the value to be debounced.
 * @param {T} value The value to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {T} The debounced value, which updates only after the delay.
 */
export function useDebounce<T,>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay has passed.
    // This ensures that only the latest value is set after a pause in updates.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
