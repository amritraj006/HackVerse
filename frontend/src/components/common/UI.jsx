import React from 'react';

// 1. Spinner Loader
export const Loader = ({ className = 'w-6 h-6', color = 'text-primary-600' }) => (
  <svg className={`animate-spin ${className} ${color}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

// 2. Button
export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 border border-transparent shadow-subtle',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-primary-500 shadow-subtle',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 border border-transparent shadow-subtle',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader className="w-4 h-4 mr-2" color={variant === 'primary' || variant === 'danger' ? 'text-white' : 'text-primary-600'} />}
      {children}
    </button>
  );
};

// 3. Input Field
export const Input = ({
  label,
  id,
  type = 'text',
  error,
  placeholder,
  value,
  onChange,
  className = '',
  required = false,
  ...props
}) => (
  <div className={`w-full ${className}`}>
    {label && (
      <label htmlFor={id} className="block text-xs font-semibold text-gray-600 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
    )}
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`block w-full px-3 py-2 text-sm bg-white border rounded shadow-subtle placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
        error ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' : 'border-gray-200'
      }`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
  </div>
);

// 4. Select Field
export const Select = ({
  label,
  id,
  options = [],
  error,
  value,
  onChange,
  className = '',
  required = false,
  placeholder = 'Select an option',
  ...props
}) => (
  <div className={`w-full ${className}`}>
    {label && (
      <label htmlFor={id} className="block text-xs font-semibold text-gray-600 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
    )}
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={`block w-full px-3 py-2 text-sm bg-white border rounded shadow-subtle focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
        error ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' : 'border-gray-200'
      }`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
  </div>
);

// 5. Badge & Status Chips
export const Badge = ({ children, variant = 'gray', className = '' }) => {
  const styles = {
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    rose: 'bg-rose-50 text-rose-800 border-rose-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

// 6. Skeleton Loader
export const Skeleton = ({ className = '', count = 1 }) => {
  const items = Array.from({ length: count });
  return (
    <>
      {items.map((_, i) => (
        <div key={i} className={`animate-pulse bg-gray-200 rounded ${className}`} />
      ))}
    </>
  );
};

// 7. Dialog / Modal
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-[1px] transition-opacity" onClick={onClose} />
      
      {/* Modal Wrapper */}
      <div className={`relative bg-white w-full rounded-lg shadow-xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden ${sizes[size]} transform transition-all`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-mono text-lg font-bold">
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

// 8. Empty State
export const EmptyState = ({
  title = 'No results found',
  description = 'Try adjusting your search filters or check back later.',
  icon,
  actionButton,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center p-8 text-center bg-white border border-gray-200 rounded-lg shadow-subtle ${className}`}>
    <div className="p-3 bg-gray-50 rounded-full border border-gray-100 mb-4 text-gray-400">
      {icon || (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
    </div>
    <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
    <p className="text-xs text-gray-500 max-w-xs mb-4">{description}</p>
    {actionButton}
  </div>
);
