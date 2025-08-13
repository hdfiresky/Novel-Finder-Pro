
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => {
  return (
    <span className={`inline-block bg-gray-700 text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
