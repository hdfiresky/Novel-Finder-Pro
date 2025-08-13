
import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, description }) => {
  const id = React.useId();
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <label htmlFor={id} className="font-medium text-gray-200 cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-400">{description}</p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800
          ${checked ? 'bg-indigo-600' : 'bg-gray-600'}
        `}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
};

export default Switch;
