export const Card = ({ children, className = '', header, footer, ...props }) => {
  return (
    <div
      className={`rounded-xl overflow-hidden transition-all duration-200 hover-lift ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(17,24,39,0.9), rgba(13,18,32,0.95))',
        border: '1px solid var(--border-normal)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
      {...props}
    >
      {header && (
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          {header}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div
          className="px-4 py-2.5"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};
