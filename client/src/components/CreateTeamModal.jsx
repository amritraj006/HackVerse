import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Alert } from './Alert';
import { hackathonService } from '../services/hackathonService';
import { X, Users } from 'lucide-react';

export const CreateTeamModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [hackathonId, setHackathonId] = useState('');
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [alert, setAlert] = useState({ type: 'info', message: '' });

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    hackathonService.getAll({ status: 'upcoming', limit: 50 })
      .then((res) => {
        if (!isMounted) return;
        const list = res?.data?.hackathons || res?.data || [];
        setHackathons(list);
        if (list.length > 0) setHackathonId(list[0]._id);
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setFetching(false); });

    return () => { isMounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setAlert({ type: 'error', message: 'Team name is required' });
      return;
    }
    if (!hackathonId) {
      setAlert({ type: 'error', message: 'Please select a hackathon' });
      return;
    }

    setLoading(true);
    try {
      await onSuccess({ hackathonId, name: name.trim() });
      setName('');
      onClose();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to create team' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <Users className="w-4 h-4" />
            <h2 className="text-sm font-bold text-slate-900">Create New Team</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Team Name"
            placeholder="e.g. Neural Ninjas"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Select Hackathon</label>
            {fetching ? (
              <div className="text-xs text-slate-400 py-1">Loading hackathons...</div>
            ) : hackathons.length === 0 ? (
              <div className="text-xs text-rose-500 py-1">No active hackathons available to form teams for.</div>
            ) : (
              <select
                value={hackathonId}
                onChange={(e) => setHackathonId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
              >
                {hackathons.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.title} (Max {h.maxTeamSize || 4} members)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button size="sm" variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading || hackathons.length === 0}>
              {loading ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
