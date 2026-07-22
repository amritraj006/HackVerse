import { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { TeamCard } from '../components/TeamCard';
import { ConfirmModal } from '../components/ConfirmModal';
import { CreateTeamModal } from '../components/CreateTeamModal';
import { JoinTeamModal } from '../components/JoinTeamModal';
import { InviteMemberModal } from '../components/InviteMemberModal';
import { TransferLeadershipModal } from '../components/TransferLeadershipModal';
import { teamService } from '../services/teamService';
import { hackathonService } from '../services/hackathonService';
import { useAuth } from '../hooks/useAuth';
import {
  Users,
  UserPlus,
  KeyRound,
  RefreshCw,
  Filter,
} from 'lucide-react';

export const Teams = () => {
  const { user } = useAuth();
  const isOrganizer = user?.role === 'organizer';
  const isJudge = user?.role === 'judge';
  const isReadOnlyView = isOrganizer || isJudge;

  const [activeTab, setActiveTab] = useState(isReadOnlyView ? 'hackathon' : 'my');
  const [myTeams, setMyTeams] = useState([]);
  const [hackathonTeams, setHackathonTeams] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState('');

  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: 'info', message: '' });

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  // Invite Modal
  const [inviteModal, setInviteModal] = useState({ open: false, team: null });

  // Transfer Leadership Modal
  const [transferModal, setTransferModal] = useState({ open: false, team: null, targetMember: null });

  // Confirm Modals (Remove, Leave, Delete)
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: '',
    action: null,
    loading: false,
  });

  // Load My Teams
  const loadMyTeams = useCallback(() => {
    let isMounted = true;
    teamService.getMyTeams()
      .then((res) => {
        if (isMounted && res?.data) setMyTeams(res.data);
      })
      .catch((err) => {
        if (isMounted) setAlert({ type: 'error', message: err.message || 'Failed to load teams.' });
      })
      .finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, []);

  // Load Hackathons for filtering
  useEffect(() => {
    let isMounted = true;
    hackathonService.getAll({ limit: 50 })
      .then((res) => {
        if (!isMounted) return;
        const list = res?.data?.hackathons || res?.data || [];
        setHackathons(list);
        if (list.length > 0 && !selectedHackathonId) setSelectedHackathonId(list[0]._id);
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [selectedHackathonId]);

  // Load Hackathon-specific Teams
  const loadHackathonTeams = useCallback(() => {
    if (!selectedHackathonId) return () => {};
    let isMounted = true;
    teamService.getHackathonTeams(selectedHackathonId)
      .then((res) => {
        if (isMounted && res?.data) setHackathonTeams(res.data);
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [selectedHackathonId]);

  useEffect(() => {
    if (activeTab === 'my') {
      return loadMyTeams();
    } else {
      return loadHackathonTeams();
    }
  }, [activeTab, loadMyTeams, loadHackathonTeams]);

  // Handlers
  const handleCreateSuccess = async (data) => {
    await teamService.create(data);
    setAlert({ type: 'success', message: 'Team created successfully! 🎉' });
    loadMyTeams();
  };

  const handleJoinSuccess = async (joinCode) => {
    await teamService.joinByCode(joinCode);
    setAlert({ type: 'success', message: 'Successfully joined team! 🎉' });
    loadMyTeams();
  };

  const handleInviteSuccess = async (teamId, email) => {
    await teamService.inviteMember(teamId, email);
    setAlert({ type: 'success', message: `Added ${email} to team successfully!` });
    loadMyTeams();
  };

  const handleTransferSuccess = async (teamId, newLeaderId) => {
    await teamService.transferLeadership(teamId, newLeaderId);
    setAlert({ type: 'success', message: 'Leadership transferred successfully!' });
    loadMyTeams();
  };

  // Remove Member Confirm
  const handleRemoveMemberClick = (teamId, memberId, memberName) => {
    setConfirmState({
      open: true,
      title: 'Remove Teammate',
      message: `Are you sure you want to remove ${memberName} from the team?`,
      confirmText: 'Remove',
      action: async () => {
        await teamService.removeMember(teamId, memberId);
        setAlert({ type: 'success', message: `Removed ${memberName} from team.` });
        loadMyTeams();
      },
      loading: false,
    });
  };

  // Leave Team Confirm
  const handleLeaveClick = (teamId, teamName) => {
    setConfirmState({
      open: true,
      title: 'Leave Team',
      message: `Are you sure you want to leave team "${teamName}"?`,
      confirmText: 'Leave Team',
      action: async () => {
        await teamService.leaveTeam(teamId);
        setAlert({ type: 'success', message: `Left team "${teamName}".` });
        loadMyTeams();
      },
      loading: false,
    });
  };

  // Delete Team Confirm
  const handleDeleteClick = (teamId, teamName) => {
    setConfirmState({
      open: true,
      title: 'Delete Team',
      message: `Are you sure you want to delete team "${teamName}"? This action cannot be undone.`,
      confirmText: 'Delete Team',
      action: async () => {
        await teamService.deleteTeam(teamId);
        setAlert({ type: 'success', message: `Team "${teamName}" deleted.` });
        loadMyTeams();
      },
      loading: false,
    });
  };

  const handleConfirmExecute = async () => {
    if (!confirmState.action) return;
    setConfirmState((prev) => ({ ...prev, loading: true }));
    try {
      await confirmState.action();
      setConfirmState({ open: false, title: '', message: '', confirmText: '', action: null, loading: false });
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Action failed.' });
      setConfirmState((prev) => ({ ...prev, loading: false }));
    }
  };

  const currentTeamsList = activeTab === 'my' ? myTeams : hackathonTeams;

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900">Teams Workspace</h1>
          <p className="text-xs text-slate-500">
            {isReadOnlyView
              ? 'Browse registered teams for hackathons.'
              : 'Create or join teams, manage members, transfer leadership, and collaborate.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isReadOnlyView && (
            <>
              <Button size="sm" variant="outline" onClick={() => setIsJoinOpen(true)}>
                <KeyRound className="w-3.5 h-3.5" /> Join Code
              </Button>
              <Button size="sm" variant="primary" onClick={() => setIsCreateOpen(true)}>
                <UserPlus className="w-3.5 h-3.5" /> Create Team
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={activeTab === 'my' ? loadMyTeams : loadHackathonTeams}>
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          </Button>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

      {/* Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 border-b border-slate-200 w-full sm:w-auto">
          {!isReadOnlyView && (
            <button
              onClick={() => { setActiveTab('my'); setLoading(true); }}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'my'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              My Teams ({myTeams.length})
            </button>
          )}
          <button
            onClick={() => { setActiveTab('hackathon'); setLoading(true); }}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'hackathon'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            All Hackathon Teams
          </button>
        </div>

        {/* Hackathon Selector for "All Hackathon Teams" tab */}
        {activeTab === 'hackathon' && hackathons.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedHackathonId}
              onChange={(e) => { setSelectedHackathonId(e.target.value); setLoading(true); }}
              className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white"
            >
              {hackathons.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Grid of Teams */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-xs text-slate-500 gap-2">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading teams...</span>
        </div>
      ) : currentTeamsList.length === 0 ? (
        <div className="py-12 text-center space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <Users className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">
            {activeTab === 'my'
              ? "You aren't a member of any teams yet."
              : 'No teams created for this hackathon yet.'}
          </p>
          {!isReadOnlyView && activeTab === 'my' && (
            <div className="flex items-center justify-center gap-2">
              <Button size="sm" variant="primary" onClick={() => setIsCreateOpen(true)}>
                <UserPlus className="w-3.5 h-3.5" /> Create a Team
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsJoinOpen(true)}>
                <KeyRound className="w-3.5 h-3.5" /> Enter Join Code
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentTeamsList.map((team) => (
            <TeamCard
              key={team._id}
              team={team}
              currentUserId={user?._id || user?.id}
              readOnly={isReadOnlyView}
              onInvite={(t) => setInviteModal({ open: true, team: t })}
              onRemoveMember={(teamId, memberId, memberName) =>
                handleRemoveMemberClick(teamId, memberId, memberName)
              }
              onTransferLeadership={(teamId, memberId, memberName) =>
                setTransferModal({
                  open: true,
                  team,
                  targetMember: { id: memberId, name: memberName },
                })
              }
              onLeave={(teamId, teamName) => handleLeaveClick(teamId, teamName)}
              onDelete={(teamId, teamName) => handleDeleteClick(teamId, teamName)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateTeamModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <JoinTeamModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSuccess={handleJoinSuccess}
      />

      <InviteMemberModal
        isOpen={inviteModal.open}
        team={inviteModal.team}
        onClose={() => setInviteModal({ open: false, team: null })}
        onSuccess={handleInviteSuccess}
      />

      <TransferLeadershipModal
        isOpen={transferModal.open}
        team={transferModal.team}
        targetMember={transferModal.targetMember}
        onClose={() => setTransferModal({ open: false, team: null, targetMember: null })}
        onSuccess={handleTransferSuccess}
      />

      <ConfirmModal
        isOpen={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        confirmVariant="danger"
        loading={confirmState.loading}
        onClose={() => setConfirmState((prev) => ({ ...prev, open: false }))}
        onConfirm={handleConfirmExecute}
      />
    </div>
  );
};
