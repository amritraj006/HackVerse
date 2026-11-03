import toast from 'react-hot-toast';
import {
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Sparkles,
  Loader2,
  X,
} from 'lucide-react';

/**
 * CyberToast Component: Bespoke, futuristic Hackathon-themed toast card.
 * Features:
 * - Glassmorphism with dynamic neon rim-glow
 * - Monospace category badge
 * - Glowing Lucide icon container
 * - Auto-dismiss animated countdown progress bar
 * - Close button with smooth hover scale
 */
const CyberToast = ({ t, type = 'info', title, description }) => {
  const configs = {
    success: {
      badge: 'SYS.SUCCESS',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      border: 'border-emerald-500/40 shadow-[0_10px_35px_-8px_rgba(16,185,129,0.35)]',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      accentBar: 'from-emerald-400 via-teal-400 to-cyan-400',
      Icon: CheckCircle2,
      pulse: 'shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    },
    error: {
      badge: 'SYS.ERROR',
      badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      border: 'border-rose-500/40 shadow-[0_10px_35px_-8px_rgba(244,63,94,0.35)]',
      iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      accentBar: 'from-rose-500 via-red-500 to-orange-500',
      Icon: AlertOctagon,
      pulse: 'shadow-[0_0_12px_rgba(244,63,94,0.5)]',
    },
    warning: {
      badge: 'SYS.WARN',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      border: 'border-amber-500/40 shadow-[0_10px_35px_-8px_rgba(245,158,11,0.35)]',
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      accentBar: 'from-amber-400 via-yellow-400 to-orange-400',
      Icon: AlertTriangle,
      pulse: 'shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    },
    info: {
      badge: 'SYS.NOTICE',
      badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      border: 'border-cyan-500/40 shadow-[0_10px_35px_-8px_rgba(6,182,212,0.35)]',
      iconBg: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
      accentBar: 'from-cyan-400 via-sky-400 to-indigo-500',
      Icon: Sparkles,
      pulse: 'shadow-[0_0_12px_rgba(6,182,212,0.5)]',
    },
    loading: {
      badge: 'SYS.SYNCING',
      badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      border: 'border-indigo-500/40 shadow-[0_10px_35px_-8px_rgba(99,102,241,0.35)]',
      iconBg: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      accentBar: 'from-indigo-500 via-purple-500 to-pink-500',
      Icon: Loader2,
      pulse: 'shadow-[0_0_12px_rgba(99,102,241,0.5)]',
      spin: true,
    },
  };

  const config = configs[type] || configs.info;
  const { Icon, spin, pulse } = config;

  return (
    <div
      className={`${
        t?.visible !== false ? 'animate-enter opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
      } max-w-sm w-full relative group overflow-hidden rounded-xl border backdrop-blur-xl bg-slate-950/95 text-slate-100 transition-all duration-200 ${config.border} p-3.5`}
      style={{
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Top subtle rim-light */}
      <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${config.accentBar} opacity-90`} />

      <div className="flex items-start gap-3">
        {/* Glowing Icon Pod */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${config.iconBg} ${pulse}`}
        >
          <Icon className={`w-4 h-4 ${spin ? 'animate-spin' : ''}`} />
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className={`font-mono text-[9px] font-semibold px-1.5 py-0.2 rounded border uppercase tracking-wider ${config.badgeColor}`}
            >
              {config.badge}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">hackverse.io</span>
          </div>
          <p className="text-xs font-bold text-white tracking-tight leading-snug line-clamp-2">
            {title}
          </p>
          {description && (
            <p className="text-[11px] text-slate-300/90 leading-relaxed mt-0.5 line-clamp-3 font-normal">
              {description}
            </p>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toast.dismiss(t.id);
          }}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          aria-label="Dismiss toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Auto-Dismiss Progress Bar for timed toasts */}
      {t.duration && t.duration !== Infinity && (
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${config.accentBar}`}
            style={{
              animation: `toastCountdown ${t.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Universal Toast Dispatcher with clean signature:
 * notify.success(message, options)
 * notify.error(message, options)
 * notify.warning(message, options)
 * notify.info(message, options)
 * notify.promise(promise, { loading, success, error })
 */
const parseArgs = (titleOrMessage, descriptionOrOptions) => {
  let title;
  let description = '';
  let duration = 4200;

  if (typeof titleOrMessage === 'object' && titleOrMessage !== null) {
    title = titleOrMessage.title || titleOrMessage.message || '';
    description = titleOrMessage.description || '';
    if (titleOrMessage.duration) duration = titleOrMessage.duration;
  } else {
    title = String(titleOrMessage || '');
    if (typeof descriptionOrOptions === 'string') {
      description = descriptionOrOptions;
    } else if (typeof descriptionOrOptions === 'object' && descriptionOrOptions !== null) {
      if (descriptionOrOptions.description) description = descriptionOrOptions.description;
      if (descriptionOrOptions.duration) duration = descriptionOrOptions.duration;
    }
  }

  return { title, description, duration };
};

export const notify = {
  success: (titleOrMessage, descriptionOrOptions) => {
    if (!titleOrMessage) return;
    const { title, description, duration } = parseArgs(titleOrMessage, descriptionOrOptions);
    return toast.custom(
      (t) => <CyberToast t={t} type="success" title={title} description={description} />,
      { duration }
    );
  },

  error: (titleOrMessage, descriptionOrOptions) => {
    if (!titleOrMessage) return;
    const { title, description, duration } = parseArgs(titleOrMessage, descriptionOrOptions);
    return toast.custom(
      (t) => <CyberToast t={t} type="error" title={title} description={description} />,
      { duration: duration || 5000 }
    );
  },

  warning: (titleOrMessage, descriptionOrOptions) => {
    if (!titleOrMessage) return;
    const { title, description, duration } = parseArgs(titleOrMessage, descriptionOrOptions);
    return toast.custom(
      (t) => <CyberToast t={t} type="warning" title={title} description={description} />,
      { duration: duration || 4500 }
    );
  },

  info: (titleOrMessage, descriptionOrOptions) => {
    if (!titleOrMessage) return;
    const { title, description, duration } = parseArgs(titleOrMessage, descriptionOrOptions);
    return toast.custom(
      (t) => <CyberToast t={t} type="info" title={title} description={description} />,
      { duration: duration || 4000 }
    );
  },

  loading: (titleOrMessage, descriptionOrOptions) => {
    if (!titleOrMessage) return;
    const { title, description } = parseArgs(titleOrMessage, descriptionOrOptions);
    return toast.custom(
      (t) => <CyberToast t={t} type="loading" title={title} description={description} />,
      { duration: Infinity }
    );
  },

  promise: (promise, messages = {}) => {
    const toastId = toast.custom(
      (t) => (
        <CyberToast
          t={t}
          type="loading"
          title={messages.loading || 'Processing request...'}
        />
      ),
      { duration: Infinity }
    );

    return promise
      .then((res) => {
        toast.dismiss(toastId);
        const successMsg = typeof messages.success === 'function' ? messages.success(res) : messages.success || 'Operation completed!';
        notify.success(successMsg);
        return res;
      })
      .catch((err) => {
        toast.dismiss(toastId);
        const errorMsg = typeof messages.error === 'function' ? messages.error(err) : messages.error || err?.message || 'Operation failed.';
        notify.error(errorMsg);
        throw err;
      });
  },

  dismiss: (id) => toast.dismiss(id),
};

export default notify;
