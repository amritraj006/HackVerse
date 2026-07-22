import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Alert } from './Alert';
import { X, UserPlus } from 'lucide-react';

export const InviteMemberModal = ({ isOpen, team, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: 'info', message: '' });

  if (!isOpen || !team) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setAlert({ type: 'error', message: 'Email address is required' });
      return;
    }

    setLoading(true);
    try {
      await onSuccess(team._id, email.trim());
      setEmail('');
      onClose();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to invite member' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <UserPlus className="w-4 h-4" />
            <h2 className="text-sm font-bold text-slate-900">Add Teammate to "{team.name}"</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="User Email Address"
            type="email"
            placeholder="e.g. teammate@hackverse.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <p className="text-[11px] text-slate-400">The user must have an active registered account on HackVerse.</p>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button size="sm" variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Teammate'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
