export const Select = ({
  label,
  id,
  options = [],
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
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full py-2 text-xs bg-slate-50 dark:bg-slate-900/80 border rounded-lg text-slate-800 dark:text-slate-100 transition-all duration-150 focus:outline-none focus:bg-white dark:focus:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed appearance-none cursor-pointer ${
            Icon ? 'pl-8 pr-8' : 'px-3 pr-8'
          } ${
            error
              ? 'border-rose-400 dark:border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
          }`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
          ▼
        </div>
      </div>
      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
};
