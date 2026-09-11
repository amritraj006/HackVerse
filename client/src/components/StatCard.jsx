import { Card } from './Card';

const colorThemes = {
  indigo:  { from: '#6366f1', to: '#8b5cf6', glow: 'rgba(99,102,241,0.25)',  text: '#a5b4fc' },
  emerald: { from: '#10b981', to: '#059669', glow: 'rgba(16,185,129,0.25)',  text: '#6ee7b7' },
  amber:   { from: '#f59e0b', to: '#d97706', glow: 'rgba(245,158,11,0.25)', text: '#fcd34d' },
  rose:    { from: '#f43f5e', to: '#e11d48', glow: 'rgba(244,63,94,0.25)',  text: '#fca5a5' },
  blue:    { from: '#3b82f6', to: '#2563eb', glow: 'rgba(59,130,246,0.25)', text: '#93c5fd' },
  purple:  { from: '#a855f7', to: '#7c3aed', glow: 'rgba(168,85,247,0.25)', text: '#d8b4fe' },
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'indigo',
  className = '',
}) => {
  const theme = colorThemes[color] || colorThemes.indigo;

  return (
    <Card className={`${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1 min-w-0">
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            {title}
          </p>
          <p
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>

        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3"
          style={{
            background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
            boxShadow: `0 0 20px ${theme.glow}`,
          }}
        >
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
      </div>

      {trend && (
        <div
          className="mt-3 pt-2.5 flex items-center gap-1.5 text-[11px]"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <span
            className="font-semibold"
            style={{ color: trend.positive ? '#10b981' : '#f43f5e' }}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>{trend.label}</span>
        </div>
      )}
    </Card>
  );
};
