
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface RangeSliderProps {
  /** The minimum value of the range. */
  min: number;
  /** The maximum value of the range. */
  max: number;
  /** The step increment of the slider. */
  step: number;
  /** The current value of the range as a tuple `[min, max]`. */
  value: [number, number];
  /** Callback function invoked when the slider value changes. */
  onChange: (value: [number, number]) => void;
  /** A label to display for the slider. */
  label: string;
}

/**
 * A dual-thumb range slider component for selecting a minimum and maximum value within a range.
 * It features debounced updates to avoid performance issues on rapid changes.
 * The component is styled with custom thumbs and a highlighted range track.
 * @param {RangeSliderProps} props The props for the RangeSlider component.
 * @returns {JSX.Element} A fully functional range slider with numeric inputs.
 */
const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, step, value, onChange, label }) => {
  // Local state for immediate feedback on the UI, while the parent state is updated with a debounce.
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);

  const range = useRef<HTMLDivElement>(null);
  const minValRef = useRef(minVal);
  const maxValRef = useRef(maxVal);

  // Keep refs in sync with state to use in callbacks without causing re-renders.
  useEffect(() => {
    minValRef.current = minVal;
    maxValRef.current = maxVal;
  }, [minVal, maxVal]);

  // Convert a numeric value to its percentage position on the slider track.
  const getPercent = useCallback((value: number) => Math.round(((value - min) / (max - min)) * 100), [min, max]);

  // Effect to update the visual range bar (the highlighted part of the track).
  // Updates based on the minimum value change.
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Updates the visual range bar based on the maximum value change.
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  // Debounce the final `onChange` call to the parent component.
  // This prevents excessive re-renders and computations in the parent
  // while the user is actively dragging the slider.
  useEffect(() => {
    const handler = setTimeout(() => {
      if (value[0] !== minVal || value[1] !== maxVal) {
        onChange([minVal, maxVal]);
      }
    }, 500); // 500ms delay after the user stops changing the value.
    return () => clearTimeout(handler);
  }, [minVal, maxVal, onChange, value]);

  // Sync local state if the `value` prop changes from the parent.
  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value]);

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinVal = Math.min(Number(e.target.value) || min, maxVal - step);
    setMinVal(newMinVal);
  };
  
  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMaxVal = Math.max(Number(e.target.value) || max, minVal + step);
    setMaxVal(newMaxVal);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minVal.toFixed(label === 'Rating' ? 1 : 0)}
            onChange={handleMinInputChange}
            min={min}
            max={max}
            step={step}
            aria-label={`${label} minimum value`}
            className="w-20 bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-sm text-center text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <span className="text-gray-500">-</span>
           <input
            type="number"
            value={maxVal.toFixed(label === 'Rating' ? 1 : 0)}
            onChange={handleMaxInputChange}
            min={min}
            max={max}
            step={step}
            aria-label={`${label} maximum value`}
            className="w-20 bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-sm text-center text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
       <div className="relative h-5 flex items-center">
        <div className="relative w-full h-full px-2.5">
          <div className="relative w-full h-full">
            <div className="absolute w-full h-1.5 rounded-md bg-gray-700 top-1/2 -translate-y-1/2" aria-hidden="true"></div>
            <div ref={range} className="absolute h-1.5 rounded-md bg-indigo-500 top-1/2 -translate-y-1/2" aria-hidden="true"></div>

            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={minVal}
              onChange={(event) => {
                const value = Math.min(Number(event.target.value), maxVal - step);
                setMinVal(value);
              }}
              className="thumb thumb--left"
              style={{ zIndex: minVal > max - 100 ? 5 : undefined }}
              aria-label={`${label} minimum slider`}
            />
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={maxVal}
              onChange={(event) => {
                const value = Math.max(Number(event.target.value), minVal + step);
                setMaxVal(value);
              }}
              className="thumb thumb--right"
              aria-label={`${label} maximum slider`}
            />
          </div>
        </div>
      </div>
      <style>{`
        /* Hide number input arrows for a cleaner look */
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield;
        }

        /* Base styles for the range input thumbs */
        .thumb {
            pointer-events: none;
            position: absolute;
            height: 0;
            width: 100%;
            outline: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background: transparent;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
        }

        /* Custom styles for WebKit browser thumbs (Chrome, Safari) */
        .thumb::-webkit-slider-thumb {
            -webkit-appearance: none;
            pointer-events: all;
            width: 1.25rem;
            height: 1.25rem;
            background-color: #f8fafc; /* slate-50 */
            border-radius: 9999px;
            border: 3px solid #6366f1; /* indigo-500 */
            cursor: pointer;
            transition: box-shadow 0.2s ease;
            position: relative;
            z-index: 1;
        }
        .thumb::-webkit-slider-thumb:active {
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.5);
        }

        /* Custom styles for Mozilla Firefox thumbs */
        .thumb::-moz-range-thumb {
            pointer-events: all;
            width: 1.25rem;
            height: 1.25rem;
            background-color: #f8fafc;
            border-radius: 9999px;
            border: 3px solid #6366f1;
            cursor: pointer;
            position: relative;
            z-index: 1;
        }
      `}</style>
    </div>
  );
};

export default RangeSlider;
