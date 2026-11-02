import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { Input } from './Input';
import { Alert } from './Alert';
import { X, KeyRound } from 'lucide-react';

export const JoinTeamModal = ({ isOpen, onClose, onSuccess }) => {
  const [joinCode, setJoinCode] = useState('');
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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setAlert({ type: 'error', message: 'Join code is required' });
      return;
    }

    setLoading(true);
    try {
      await onSuccess(joinCode.trim());
      setJoinCode('');
      onClose();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to join team' });
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-sm max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden my-auto backdrop-blur-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-indigo-500">
            <KeyRound className="w-4 h-4" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Join Team via Code</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

          <form id="join-team-form" onSubmit={handleSubmit} className="space-y-3">
            <Input
              label="6-Character Join Code"
              placeholder="e.g. HEX92K"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={10}
              required
            />
            <p className="text-[11px] text-slate-400">Ask your team leader for the 6-character team join code.</p>
          </form>
        </div>

        <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2 shrink-0">
          <Button size="sm" variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" type="submit" form="join-team-form" disabled={loading}>
            {loading ? 'Joining...' : 'Join Team'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
