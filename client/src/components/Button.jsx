const variants = {
  primary:
    'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-[0_2px_14px_rgba(99,102,241,0.35)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.55)] border border-indigo-400/30 active:scale-[0.98]',
  secondary:
    'bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700/80 active:scale-[0.98]',
  outline:
    'bg-transparent border border-indigo-500/40 hover:border-indigo-400 hover:bg-indigo-500/10 text-slate-700 dark:text-slate-200 active:scale-[0.98]',
  danger:
    'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-[0_2px_12px_rgba(244,63,94,0.35)] border border-rose-400/30 active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg font-semibold tracking-wide',
  md: 'px-4 py-2 text-xs md:text-sm rounded-lg font-semibold tracking-wide',
  lg: 'px-5 py-2.5 text-sm rounded-xl font-semibold tracking-wide',
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
      className={`inline-flex items-center justify-center gap-1.5 transition-all duration-180 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
