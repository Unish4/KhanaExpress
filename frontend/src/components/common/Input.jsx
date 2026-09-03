import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      type = 'text',
      placeholder,
      required = false,
      disabled = false,
      className = '',
      id,
      icon: Icon,
      helperText,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 select-none"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-xs">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full text-sm rounded-lg border-1.5 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
              Icon ? 'pl-9' : ''
            } ${
              error
                ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-100'
                : 'border-slate-200 focus:border-[#f97316] focus:bg-[#fff7ed]/20 focus:ring-2 focus:ring-[#f97316]/15'
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs font-medium text-red-600 animate-fadeIn">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
