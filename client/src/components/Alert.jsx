import { useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { notify } from '../utils/toast';

const alertStyles = {
  error: 'bg-rose-50/90 text-rose-900 border-rose-200/90 shadow-xs',
  success: 'bg-emerald-50/90 text-emerald-900 border-emerald-200/90 shadow-xs',
  warning: 'bg-amber-50/90 text-amber-900 border-amber-200/90 shadow-xs',
  info: 'bg-indigo-50/90 text-indigo-900 border-indigo-200/90 shadow-xs',
};

const alertIcons = {
  error: XCircle,
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
};

export const Alert = ({ type = 'info', message, onClose, className = '', showToast = true }) => {
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
      className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 transition-all duration-200 animate-in fade-in slide-in-from-top-1 ${alertStyles[type]} ${className}`}
    >
      <IconComponent className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0 font-medium leading-relaxed">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded-lg transition-colors text-slate-500 hover:text-slate-800 cursor-pointer"
          aria-label="Close alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

