import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Alert } from './Alert';
import { X, KeyRound } from 'lucide-react';

export const JoinTeamModal = ({ isOpen, onClose, onSuccess }) => {
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: 'info', message: '' });

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <KeyRound className="w-4 h-4" />
            <h2 className="text-sm font-bold text-slate-900">Join Team via Code</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="6-Character Join Code"
            placeholder="e.g. HEX92K"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={10}
            required
          />
          <p className="text-[11px] text-slate-400">Ask your team leader for the 6-character team join code.</p>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button size="sm" variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading}>
              {loading ? 'Joining...' : 'Join Team'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
