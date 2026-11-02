export const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required = false,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full py-2 text-xs bg-slate-50 dark:bg-slate-900/80 border rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all duration-150 focus:outline-none focus:bg-white dark:focus:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed ${
            Icon ? 'pl-8 pr-3' : 'px-3'
          } ${
            error
              ? 'border-rose-400 dark:border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
          }`}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
};
