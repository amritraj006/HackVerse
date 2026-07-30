import { useState } from 'react';
import { X, User, Users, ArrowRight, UserPlus, KeyRound, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { registrationService } from '../services/registrationService';
import { teamService } from '../services/teamService';

export const RegisterHackathonModal = ({
  isOpen,
  onClose,
  hackathon,
  onSuccess,
}) => {
  const [step, setStep] = useState('choice'); // 'choice' | 'group'
  const [groupTab, setGroupTab] = useState('create'); // 'create' | 'join'
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !hackathon) return null;

  const handleClose = () => {
    setStep('choice');
    setGroupTab('create');
    setTeamName('');
    setJoinCode('');
    setError('');
    onClose();
  };

  // Solo Registration Handler
  const handleSoloRegister = async () => {
    setLoading(true);
    setError('');
    try {
      await registrationService.register(hackathon._id);
      if (onSuccess) onSuccess('Successfully registered solo for ' + hackathon.title + '! 🎉');
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to register solo.');
    } finally {
      setLoading(false);
    }
  };

  // Group - Create Team Handler
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setError('Please enter a team name');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const createFn = teamService.createTeam || teamService.create;
      await createFn({
        hackathonId: hackathon._id,
        name: teamName.trim(),
      });
      if (onSuccess) onSuccess(`Successfully created team "${teamName.trim()}" and registered for ${hackathon.title}! 🚀`);
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to create team.');
    } finally {
      setLoading(false);
    }
  };

  // Group - Join Team Handler
  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setError('Please enter a team join code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const joinFn = teamService.joinTeamByCode || teamService.joinByCode;
      const res = await joinFn(joinCode.trim());
      const team = res.data || res;
      if (onSuccess) onSuccess(`Successfully joined team "${team.name || 'group'}" and registered for ${hackathon.title}! 👥`);
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to join team. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">Hackathon Registration</h2>
              <p className="text-[11px] text-slate-300 truncate max-w-[260px]">{hackathon.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hackathon.maxParticipants > 0 && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  (hackathon.availableSlots ?? 0) > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {(hackathon.availableSlots ?? 0) > 0 ? `${hackathon.availableSlots} slots left` : 'Full'}
              </span>
            )}
            <button
              onClick={handleClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {hackathon.maxParticipants > 0 && hackathon.availableSlots === 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 font-medium text-[11px]">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                This hackathon has reached its maximum limit of <strong>{hackathon.maxParticipants}</strong> participants. Registrations are currently full.
              </span>
            </div>
          )}

          {step === 'choice' ? (
            /* STEP 1: CHOICE (SOLO vs GROUP) */
            <div className="space-y-3">
              <p className="text-slate-600 font-medium text-center text-xs">
                How would you like to participate in this hackathon?
              </p>

              <div className="grid grid-cols-1 gap-3">
                {/* Option 1: Solo */}
                <button
                  type="button"
                  onClick={handleSoloRegister}
                  disabled={loading || (hackathon.maxParticipants > 0 && hackathon.availableSlots === 0)}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 disabled:opacity-50 disabled:cursor-not-allowed text-left transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 group-hover:text-indigo-700">Register Solo</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Participate as an individual creator. You can build and submit projects on your own.
                    </p>
                  </div>
                </button>

                {/* Option 2: Group / Team */}
                <button
                  type="button"
                  onClick={() => setStep('group')}
                  disabled={loading}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 group-hover:text-indigo-700">Register in Group / Team</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Collaborate with a group. Join an existing team via Join Code or create a new team first.
                    </p>
                  </div>
                </button>
              </div>

              {loading && (
                <div className="text-center py-2 text-indigo-600 font-semibold flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  Processing registration...
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: GROUP OPTIONS (CREATE TEAM OR JOIN TEAM) */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => { setStep('choice'); setError(''); }}
                  className="text-indigo-600 hover:underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  ← Back to options
                </button>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Group Registration</span>
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setGroupTab('create'); setError(''); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    groupTab === 'create'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" /> Create New Team
                </button>
                <button
                  type="button"
                  onClick={() => { setGroupTab('join'); setError(''); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    groupTab === 'join'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" /> Join Existing Team
                </button>
              </div>

              {groupTab === 'create' ? (
                /* CREATE TEAM FORM */
                <form onSubmit={handleCreateTeam} className="space-y-3">
                  <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 text-[11px] text-indigo-900 leading-relaxed">
                    💡 If a team hasn't been created yet for your group, create your team first. You will become the <strong>Team Leader</strong> and can invite your team members.
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Team Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. Cyber Punks, Code Ninjas"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Creating Team...
                        </span>
                      ) : (
                        'Create Team & Register'
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                /* JOIN TEAM FORM */
                <form onSubmit={handleJoinTeam} className="space-y-3">
                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-900 leading-relaxed">
                    🔑 Enter the 6-character Join Code shared by your team leader to join their existing team and register together.
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Team Join Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="e.g. A1B2C3"
                      maxLength={10}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono uppercase tracking-widest focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Joining Team...
                        </span>
                      ) : (
                        'Join Team & Register'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
