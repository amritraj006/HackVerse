import { useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { notify } from '../utils/toast';

const alertConfig = {
  error: {
    bg: 'rgba(244,63,94,0.08)',
    border: 'rgba(244,63,94,0.25)',
    icon: XCircle,
    iconColor: '#f43f5e',
    textColor: '#fca5a5',
  },
  success: {
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.25)',
    icon: CheckCircle2,
    iconColor: '#10b981',
    textColor: '#6ee7b7',
  },
  warning: {
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    icon: AlertCircle,
    iconColor: '#f59e0b',
    textColor: '#fcd34d',
  },
  info: {
    bg: 'rgba(99,102,241,0.08)',
    border: 'rgba(99,102,241,0.25)',
    icon: Info,
    iconColor: '#6366f1',
    textColor: '#a5b4fc',
  },
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

  const cfg = alertConfig[type] || alertConfig.info;
  const IconComponent = cfg.icon;

  return (
    <div
      className={`p-3.5 rounded-xl flex items-start gap-3 text-xs animate-fade-in ${className}`}
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <IconComponent
        className="w-4 h-4 shrink-0 mt-0.5"
        style={{ color: cfg.iconColor }}
      />
      <div
        className="flex-1 min-w-0 font-medium leading-relaxed"
        style={{ color: cfg.textColor }}
      >
        {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg transition-colors cursor-pointer"
          style={{ color: cfg.iconColor }}
          aria-label="Close alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
