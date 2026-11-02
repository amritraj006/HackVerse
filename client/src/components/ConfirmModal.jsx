import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  loading = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-sm max-h-[calc(100vh-2rem)] overflow-y-auto p-4 sm:p-5 space-y-4 my-auto animate-fade-in backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Warning Icon & Close */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-slate-900 dark:text-white">{title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Message */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
