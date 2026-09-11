const variants = {
  primary: `
    text-white font-semibold
    bg-gradient-to-r from-indigo-500 to-violet-600
    hover:from-indigo-400 hover:to-violet-500
    shadow-lg shadow-indigo-500/20
    focus:ring-2 focus:ring-indigo-500/40
    border-0
    relative overflow-hidden
    before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0
    before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700
  `,
  secondary: `
    font-medium
    border
    hover:border-indigo-500/30
    focus:ring-2 focus:ring-slate-500/20
    transition-colors
  `,
  outline: `
    font-medium border
    hover:bg-white/5
    focus:ring-2 focus:ring-slate-500/20
  `,
  danger: `
    text-white font-semibold
    bg-gradient-to-r from-rose-500 to-rose-700
    hover:from-rose-400 hover:to-rose-600
    shadow-lg shadow-rose-500/20
    focus:ring-2 focus:ring-rose-500/40
    border-0
  `,
  ghost: `
    font-medium
    hover:bg-white/5
  `,
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-xs rounded-lg gap-1.5',
  lg: 'px-5 py-2.5 text-sm rounded-xl gap-2',
};

const variantColors = {
  primary:   { color: 'var(--text-primary)', border: 'transparent' },
  secondary: { color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', border: 'var(--border-normal)' },
  outline:   { color: 'var(--text-secondary)', background: 'transparent', border: 'var(--border-normal)' },
  danger:    { color: '#fff', border: 'transparent' },
  ghost:     { color: 'var(--text-secondary)', background: 'transparent', border: 'transparent' },
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
  const vc = variantColors[variant] || variantColors.secondary;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      style={{
        color: vc.color,
        background: vc.background,
        borderColor: vc.border,
      }}
      {...props}
    >
      {children}
    </button>
  );
};
