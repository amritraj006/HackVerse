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
        <label
          htmlFor={id}
          className="block text-xs font-semibold"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}{' '}
          {required && <span style={{ color: '#f43f5e' }}>*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
        )}
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full py-2 text-xs rounded-lg outline-none transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed appearance-none cursor-pointer ${
            Icon ? 'pl-9 pr-8' : 'px-3 pr-8'
          }`}
          style={{
            background: error ? 'rgba(244,63,94,0.05)' : 'rgba(255,255,255,0.04)',
            border: error ? '1px solid rgba(244,63,94,0.6)' : '1px solid var(--border-normal)',
            color: 'var(--text-primary)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.border = '1px solid rgba(99,102,241,0.6)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.currentTarget.style.border = '1px solid var(--border-normal)';
              e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.03)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: '#0d1220', color: '#f1f5f9' }}>
              {opt.label}
            </option>
          ))}
        </select>
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]"
          style={{ color: 'var(--text-muted)' }}
        >
          ▼
        </div>
      </div>
      {error && (
        <p className="text-[11px] font-medium" style={{ color: '#f43f5e' }}>
          {error}
        </p>
      )}
    </div>
  );
};
