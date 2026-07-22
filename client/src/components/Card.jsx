export const Card = ({ children, className = '', header, footer, ...props }) => {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden ${className}`}
      {...props}
    >
      {header && (
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
          {footer}
        </div>
      )}
    </div>
  );
};
