import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

const alertStyles = {
  error: 'bg-rose-50 text-rose-800 border-rose-200 icon-color-rose-600',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200 icon-color-emerald-600',
  warning: 'bg-amber-50 text-amber-800 border-amber-200 icon-color-amber-600',
  info: 'bg-indigo-50 text-indigo-800 border-indigo-200 icon-color-indigo-600',
};

const alertIcons = {
  error: XCircle,
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
};

export const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  if (!message) return null;

  const IconComponent = alertIcons[type] || Info;

  return (
    <div
      className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 transition-all duration-150 ${alertStyles[type]} ${className}`}
    >
      <IconComponent className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0 font-medium">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-0.5 hover:bg-black/5 rounded transition-colors text-slate-500 hover:text-slate-800"
          aria-label="Close alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
