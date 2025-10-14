

import React from 'react';

interface BadgeProps {
  /** The content to be displayed inside the badge. */
  children: React.ReactNode;
  /** Optional additional CSS classes to apply to the badge. */
  className?: string;
}

/**
 * A simple, styled badge component for displaying small pieces of information,
 * like genres, tags, or status indicators.
 * @param {BadgeProps} props The props for the Badge component.
 * @returns {JSX.Element} A styled span element.
 */
const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => {
  return (
    <span className={`inline-block bg-gray-700 text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
