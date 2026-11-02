export const Card = ({ children, className = '', header, footer, ...props }) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 rounded-xl shadow-xs dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)] backdrop-blur-md overflow-hidden relative transition-all duration-200 ${className}`}
      {...props}
    >
      {header && (
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30">
          {footer}
        </div>
      )}
    </div>
  );
};
