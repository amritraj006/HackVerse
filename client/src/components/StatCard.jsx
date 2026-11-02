import { Card } from './Card';

const colorThemes = {
  indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.25)]',
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
  rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.25)]',
  blue: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
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
  return (
    <Card className={`hover:-translate-y-1 hover:shadow-xl transition-all duration-200 border-slate-200/80 dark:border-white/10 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            {title}
          </p>
          <p className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
          {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${colorThemes[color] || colorThemes.indigo}`}
        >
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/10 flex items-center gap-1.5 text-[11px]">
          <span
            className={`font-semibold font-mono ${
              trend.positive ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-slate-400">{trend.label}</span>
        </div>
      )}
    </Card>
  );
};
