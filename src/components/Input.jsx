import React, { useMemo, forwardRef } from 'react';
import { FaSpinner, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

export const Input = forwardRef(({ 
  label, 
  type = 'text', 
  isLoading = false, 
  error, 
  success,
  tooltip, 
  className = '', 
  // 🔥 REMOVEMOS value daqui - deixe o react-hook-form controlar via ref
  onChange,
  onBlur,
  name,
  disabled = false,
  ...props 
}, ref) => {
  const inputId = useMemo(() => `input-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <div className={`relative flex flex-col ${className}`}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 text-sm font-medium text-gray-700 flex items-center">
          {label}
          {tooltip && (
            <span className="ml-2 relative group">
              <FaExclamationCircle className="text-gray-400 text-xs cursor-help" />
              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max 
                             px-3 py-2 bg-gray-900 text-white text-xs rounded-md 
                             opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                             pointer-events-none z-50 shadow-lg">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </span>
            </span>
          )}
        </label>
      )}
      
      <div className="relative">
        <input
          id={inputId}
          type={type}
          name={name}
          // 🔥 CORREÇÃO CRÍTICA: REMOVER value daqui
          // O react-hook-form controla o valor via ref
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
          disabled={disabled || isLoading}
          {...props}
          className={`
            w-full p-3 pr-12 border rounded-lg shadow-sm transition-all duration-200 
            ${error 
              ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50' 
              : success
                ? 'border-green-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50'
                : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
            }
            focus:outline-none
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-500
            text-gray-900 placeholder-gray-500
            ${isLoading ? 'pr-12' : (error || success) ? 'pr-12' : ''}
          `}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <FaSpinner className="animate-spin text-blue-500 text-sm" />
          </div>
        )}
        
        {/* Error Indicator */}
        {!isLoading && error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <FaExclamationCircle className="text-red-500 text-sm" />
          </div>
        )}
        
        {/* Success Indicator */}
        {!isLoading && success && !error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <FaCheckCircle className="text-green-500 text-sm" />
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600 flex items-center">
          <FaExclamationCircle className="mr-1.5 flex-shrink-0" /> 
          {error}
        </p>
      )}
      
      {success && !error && (
        <p className="mt-1.5 text-sm text-green-600 flex items-center">
          <FaCheckCircle className="mr-1.5 flex-shrink-0" /> 
          {success}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';