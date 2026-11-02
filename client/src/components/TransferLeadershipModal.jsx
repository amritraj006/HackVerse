import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { Alert } from './Alert';
import { X, Crown } from 'lucide-react';

export const TransferLeadershipModal = ({ isOpen, team, targetMember, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: 'info', message: '' });

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

  if (!isOpen || !team || !targetMember) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onSuccess(team._id, targetMember.id);
      onClose();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to transfer leadership' });
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-sm max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden my-auto backdrop-blur-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Crown className="w-4 h-4 shrink-0" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Transfer Leadership</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-md shrink-0 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to transfer leadership of <strong>"{team.name}"</strong> to{' '}
            <strong>{targetMember.name}</strong>? You will remain a member of the team, but lose team management privileges.
          </p>
        </div>

        <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button size="sm" variant="primary" onClick={handleConfirm} disabled={loading} type="button">
            {loading ? 'Transferring...' : 'Transfer Leadership'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
