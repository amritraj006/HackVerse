import { Card } from './Card';

const colorThemes = {
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  rose: 'bg-rose-50 text-rose-600 border-rose-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
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
    <Card className={`hover:shadow-xs transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-xl font-bold text-slate-900 tracking-tight">{value}</p>
          {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
        </div>

        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${colorThemes[color] || colorThemes.indigo}`}
        >
          {Icon && <Icon className="w-4 h-4" />}
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px]">
          <span
            className={`font-semibold ${
              trend.positive ? 'text-emerald-600' : 'text-rose-600'
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
