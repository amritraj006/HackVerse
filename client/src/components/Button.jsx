const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs focus:ring-2 focus:ring-indigo-500/20',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 focus:ring-2 focus:ring-slate-400/20',
  outline: 'bg-transparent border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-2 focus:ring-slate-300/30',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-2 focus:ring-rose-500/20',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
};

const sizes = {
  sm: 'px-2.5 py-1 text-xs rounded-md font-medium',
  md: 'px-3.5 py-1.5 text-xs rounded-md font-medium',
  lg: 'px-4 py-2 text-sm rounded-lg font-medium',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
