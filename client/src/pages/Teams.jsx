import { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { TeamCard } from '../components/TeamCard';
import { ConfirmModal } from '../components/ConfirmModal';
import { CreateTeamModal } from '../components/CreateTeamModal';
import { JoinTeamModal } from '../components/JoinTeamModal';
import { InviteMemberModal } from '../components/InviteMemberModal';
import { TransferLeadershipModal } from '../components/TransferLeadershipModal';
import { SearchBar } from '../components/SearchBar';
import { SortDropdown } from '../components/SortDropdown';
import { PaginationControls } from '../components/PaginationControls';
import { teamService } from '../services/teamService';
import { hackathonService } from '../services/hackathonService';
import { useAuth } from '../hooks/useAuth';
import { useQueryParams } from '../hooks/useQueryParams';
import {
  Users,
  UserPlus,
  KeyRound,
  RefreshCw,
  Filter,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Recently Created' },
  { value: 'name', label: 'Team Name (A-Z)' },
];

const DEFAULT_PARAMS = {
  search: '',
  status: '',
  hackathonId: '',
  sortBy: 'createdAt',
  order: 'desc',
  page: '1',
  limit: '12',
};

export const Teams = () => {
  const { user } = useAuth();
  const isOrganizer = user?.role === 'organizer';
  const isJudge = user?.role === 'judge';
  const isReadOnlyView = isOrganizer || isJudge;

  const [activeTab, setActiveTab] = useState(isReadOnlyView ? 'hackathon' : 'my');

  const [queryParams, setQueryParams, resetQueryParams] = useQueryParams(DEFAULT_PARAMS);

  const search = queryParams.search || '';
  const statusFilter = queryParams.status || '';
  const selectedHackathonId = queryParams.hackathonId || '';
  const sortBy = queryParams.sortBy || 'createdAt';
  const order = queryParams.order || 'desc';
  const page = parseInt(queryParams.page || '1', 10);
  const limit = parseInt(queryParams.limit || '12', 10);

  const [myTeams, setMyTeams] = useState([]);
  const [hackathonTeams, setHackathonTeams] = useState([]);
  const [hackathons, setHackathons] = useState([]);

  const [pagination, setPagination] = useState({ page, pages: 1, total: 0, limit });

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

  // Load Hackathons list for selector
  useEffect(() => {
    let isMounted = true;
    hackathonService
      .getAll({ limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        const list = res?.data?.hackathons || res?.data || [];
        setHackathons(list);
        if (list.length > 0 && !selectedHackathonId) {
          setQueryParams({ hackathonId: list[0]._id });
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [selectedHackathonId, setQueryParams]);

  // Load My Teams
  const loadMyTeams = useCallback(() => {
    setLoading(true);
    teamService
      .getMyTeams({
        search,
        status: statusFilter,
        sortBy,
        order,
        page,
        limit,
      })
      .then((res) => {
        if (res?.data) {
          if (Array.isArray(res.data)) {
            setMyTeams(res.data);
          } else {
            setMyTeams(res.data.teams || []);
            if (res.data.pagination) setPagination(res.data.pagination);
          }
        }
      })
      .catch((err) => {
        setAlert({ type: 'error', message: err.message || 'Failed to load teams.' });
      })
      .finally(() => setLoading(false));
  }, [search, statusFilter, sortBy, order, page, limit]);

  // Load Hackathon-specific Teams
  const loadHackathonTeams = useCallback(() => {
    if (!selectedHackathonId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    teamService
      .getHackathonTeams(selectedHackathonId, {
        search,
        status: statusFilter,
        sortBy,
        order,
        page,
        limit,
      })
      .then((res) => {
        if (res?.data) {
          if (Array.isArray(res.data)) {
            setHackathonTeams(res.data);
          } else {
            setHackathonTeams(res.data.teams || []);
            if (res.data.pagination) setPagination(res.data.pagination);
          }
        }
      })
      .catch((err) => {
        setAlert({ type: 'error', message: err.message || 'Failed to load hackathon teams.' });
      })
      .finally(() => setLoading(false));
  }, [selectedHackathonId, search, statusFilter, sortBy, order, page, limit]);

  useEffect(() => {
    if (activeTab === 'my') {
      loadMyTeams();
    } else {
      loadHackathonTeams();
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

  const handleSearchChange = (val) => {
    setQueryParams({ search: val, page: 1 });
  };

  const handleStatusChange = (val) => {
    setQueryParams({ status: val, page: 1 });
  };

  const handleHackathonChange = (hId) => {
    setQueryParams({ hackathonId: hId, page: 1 });
  };

  const handleSortChange = ({ sortBy: newSort, order: newOrder }) => {
    setQueryParams({ sortBy: newSort, order: newOrder, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setQueryParams({ page: newPage });
  };

  const handleLimitChange = (newLimit) => {
    setQueryParams({ limit: newLimit, page: 1 });
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

      {/* Tabs Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 border-b border-slate-200 w-full md:w-auto">
          {!isReadOnlyView && (
            <button
              onClick={() => {
                setActiveTab('my');
              }}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'my'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              My Teams
            </button>
          )}
          <button
            onClick={() => {
              setActiveTab('hackathon');
            }}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'hackathon'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            All Hackathon Teams
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 md:justify-end">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search teams by name..."
            loading={loading}
            className="w-full sm:w-56"
          />

          {/* Hackathon Selector for "All Hackathon Teams" tab */}
          {activeTab === 'hackathon' && hackathons.length > 0 && (
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedHackathonId}
                onChange={(e) => handleHackathonChange(e.target.value)}
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

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <SortDropdown
            options={SORT_OPTIONS}
            sortBy={sortBy}
            order={order}
            onSortChange={handleSortChange}
          />

          {(search || statusFilter) && (
            <Button size="sm" variant="ghost" onClick={resetQueryParams} className="text-xs">
              Clear
            </Button>
          )}
        </div>
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
              : 'No teams created for this hackathon yet matching criteria.'}
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

      {/* Pagination Controls */}
      {!loading && (
        <PaginationControls
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          limitOptions={[6, 12, 24, 48]}
        />
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
