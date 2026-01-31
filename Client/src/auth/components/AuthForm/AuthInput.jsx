import React from 'react';

const AuthInput = ({ label, id, type = 'text', value, onChange, error, placeholder, required = false }) => {
  return (
    <div className="flex flex-col gap-1 w-full mt-4 transition-colors duration-300">
      <label htmlFor={id} className="text-xs font-bold text-text-secondary">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 bg-brand-light border rounded-xl outline-none transition-all text-sm font-medium
          ${error ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-brand-border text-text-primary hover:bg-brand-dark/50 focus:border-brand focus:ring-4 focus:ring-brand/10'}
        `}
      />
      {error && <p className="text-xs text-red-500 mt-1 font-semibold">{error}</p>}
    </div>
  );
};

export default AuthInput;
