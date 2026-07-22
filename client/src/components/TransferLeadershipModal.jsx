import { useState } from 'react';
import { Button } from './Button';
import { Alert } from './Alert';
import { X, Crown } from 'lucide-react';

export const TransferLeadershipModal = ({ isOpen, team, targetMember, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: 'info', message: '' });

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-amber-600">
            <Crown className="w-4 h-4" />
            <h2 className="text-sm font-bold text-slate-900">Transfer Leadership</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

        <p className="text-xs text-slate-600 leading-relaxed">
          Are you sure you want to transfer leadership of <strong>"{team.name}"</strong> to{' '}
          <strong>{targetMember.name}</strong>? You will remain a member of the team, but lose team management privileges.
        </p>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Transferring...' : 'Transfer Leadership'}
          </Button>
        </div>
      </div>
    </div>
  );
};
