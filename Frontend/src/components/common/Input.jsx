import React from 'react';

const Input = ({ 
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  onKeyDown,
  autoFocus = true,
  fullWidth = false,
  extra
}) => {
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`} style={{ marginBottom: 'calc(2 * var(--unit-sm))' }}>
      {label && (
        <label htmlFor={id} className="block font-medium text-gray-700 dark:text-gray-300" style={{ fontSize: 'var(--text-sm)', marginBottom: 'calc(0.675 * var(--unit-sm))' }}>
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        <input
          type={type}
          id={id}
          autoComplete='off'
          className={`
            block w-full border border-gray-300 dark:border-gray-700 
            rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all
          `}
          style={{ 
            paddingLeft: 'calc(0.75 * var(--unit))', 
            paddingRight: 'calc(0.75 * var(--unit))', 
            paddingTop: 'calc(0.625 * var(--unit))', 
            paddingBottom: 'calc(0.625 * var(--unit))', 
            fontSize: 'var(--text-sm)',
          }}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
        />
      </div>
    </div>
  );
};

export default Input;
