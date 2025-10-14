

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** The text to display in the label associated with the input. */
  label: string;
  /** A unique identifier for the input, used to link the label to it. */
  id: string;
}

/**
 * A styled, reusable text input component that includes a label for accessibility.
 * It accepts all standard HTML input attributes, allowing for flexible use in forms.
 * @param {InputProps} props The props for the Input component.
 * @returns {JSX.Element} A div containing a label and an input field.
 */
const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  );
};

export default Input;
