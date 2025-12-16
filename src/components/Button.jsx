import React from 'react';
import { FaSpinner } from 'react-icons/fa';

export function Button({ 
  children, 
  isLoading = false, 
  disabled = false, 
  variant = 'primary',
  className = '', 
  ...props 
}) {
  const baseClasses = `relative px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 
                      flex items-center justify-center gap-3 min-h-[48px]
                      focus:outline-none focus:ring-2 focus:ring-offset-2 
                      disabled:opacity-50 disabled:cursor-not-allowed`;
  
  const variants = {
    primary: `bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 
              shadow-md hover:shadow-lg focus:ring-blue-500`,
    secondary: `bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 
                shadow-md hover:shadow-lg focus:ring-gray-500`,
    outline: `border-2 border-gray-300 text-gray-700 hover:border-gray-400 
              hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-500`
  };

  return (
    <button
      {...props}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${className}
      `}
      disabled={isLoading || disabled}
    >
      {isLoading && <FaSpinner className="animate-spin flex-shrink-0" />}
      <span className={isLoading ? 'opacity-80' : ''}>
        {children}
      </span>
    </button>
  );
}