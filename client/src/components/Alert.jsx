import { useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2, Info, XOctagon, X } from 'lucide-react';
import { notify } from '../utils/toast';

const alertStyles = {
  error:
    'bg-rose-500/10 text-rose-400 dark:text-rose-300 border-rose-500/30 shadow-[0_4px_20px_rgba(244,63,94,0.15)]',
  success:
    'bg-emerald-500/10 text-emerald-400 dark:text-emerald-300 border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.15)]',
  warning:
    'bg-amber-500/10 text-amber-400 dark:text-amber-300 border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.15)]',
  info:
    'bg-indigo-500/10 text-indigo-400 dark:text-indigo-300 border-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.15)]',
};

const alertIcons = {
  error: XOctagon,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

export const Alert = ({
  type = 'info',
  message,
  onClose,
  className = '',
  showToast = false,
}) => {
  const lastToastRef = useRef('');

  useEffect(() => {
    if (message && showToast && lastToastRef.current !== message) {
      lastToastRef.current = message;
      if (type === 'success') notify.success(message);
      else if (type === 'error') notify.error(message);
      else if (type === 'warning') notify.warning(message);
      else notify.info(message);
    }
  }, [message, type, showToast]);

  if (!message) return null;

  const IconComponent = alertIcons[type] || Info;

  return (
    <div
      className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-1 ${alertStyles[type]} ${className}`}
    >
      <IconComponent className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0 font-medium leading-relaxed">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white cursor-pointer"
          aria-label="Close alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
