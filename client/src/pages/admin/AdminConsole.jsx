import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import { DataTable } from '../../components/DataTable';
import { ConfirmModal } from '../../components/ConfirmModal';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/helpers';
import { useQueryParams } from '../../hooks/useQueryParams';
import {
  Users,
  Trophy,
  ShieldAlert,
  Ban,
  CheckCircle2,
  Trash2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

const USER_SORT_OPTIONS = [
  { value: 'createdAt', label: 'Joined Date' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'email', label: 'Email (A-Z)' },
  { value: 'role', label: 'Role' },
];

const HACKATHON_SORT_OPTIONS = [
  { value: 'createdAt', label: 'Recently Created' },
  { value: 'title', label: 'Title (A-Z)' },
  { value: 'startDate', label: 'Start Date' },
];

const SUBMISSION_SORT_OPTIONS = [
  { value: 'createdAt', label: 'Submission Date' },
  { value: 'title', label: 'Project Name (A-Z)' },
  { value: 'score', label: 'Total Score' },
];

const DEFAULT_PARAMS = {
  tab: 'users',
  search: '',
  role: '',
  isBlocked: '',
  status: '',
  sortBy: 'createdAt',
  order: 'desc',
  page: '1',
  limit: '10',
};

export const AdminConsole = () => {
  const [queryParams, setQueryParams, resetQueryParams] = useQueryParams(DEFAULT_PARAMS);

  const activeTab = queryParams.tab || 'users';
  const search = queryParams.search || '';
  const roleFilter = queryParams.role || '';
  const isBlockedFilter = queryParams.isBlocked || '';
  const statusFilter = queryParams.status || '';
  const sortBy = queryParams.sortBy || 'createdAt';
  const order = queryParams.order || 'desc';
  const page = parseInt(queryParams.page || '1', 10);
  const limit = parseInt(queryParams.limit || '10', 10);

  // State: Analytics
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // State: Users Table
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userPagination, setUserPagination] = useState({ page, limit, pages: 1, total: 0 });

  // State: Hackathons Table
  const [hackathons, setHackathons] = useState([]);
  const [hackathonsLoading, setHackathonsLoading] = useState(false);
  const [hackathonPagination, setHackathonPagination] = useState({ page, limit, pages: 1, total: 0 });

  // State: Submissions Table
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionPagination, setSubmissionPagination] = useState({ page, limit, pages: 1, total: 0 });

  // Alert State
  const [alert, setAlert] = useState({ type: 'info', message: '' });

  // Confirmation Modal State
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    action: null,
    loading: false,
  });

  // Fetch Analytics
  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await adminService.getAnalytics();
      if (res && res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // Fetch Users
  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await adminService.getUsers({
        page,
        limit,
        search,
        role: roleFilter,
        isBlocked: isBlockedFilter,
        sortBy,
        order,
      });
      if (res && res.data) {
        setUsers(res.data.users);
        setUserPagination(res.data.pagination);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load users list.' });
    } finally {
      setUsersLoading(false);
    }
  }, [page, limit, search, roleFilter, isBlockedFilter, sortBy, order]);

  // Fetch Hackathons
  const loadHackathons = useCallback(async () => {
    setHackathonsLoading(true);
    try {
      const res = await adminService.getHackathons({
        page,
        limit,
        search,
        status: statusFilter,
        sortBy,
        order,
      });
      if (res && res.data) {
        setHackathons(res.data.hackathons);
        setHackathonPagination(res.data.pagination);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load hackathons list.' });
    } finally {
      setHackathonsLoading(false);
    }
  }, [page, limit, search, statusFilter, sortBy, order]);

  // Fetch Submissions
  const loadSubmissions = useCallback(async () => {
    setSubmissionsLoading(true);
    try {
      const res = await adminService.getSubmissions({
        page,
        limit,
        search,
        status: statusFilter,
        sortBy,
        order,
      });
      if (res && res.data) {
        setSubmissions(res.data.submissions);
        setSubmissionPagination(res.data.pagination);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load submissions.' });
    } finally {
      setSubmissionsLoading(false);
    }
  }, [page, limit, search, statusFilter, sortBy, order]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'hackathons') {
      loadHackathons();
    } else if (activeTab === 'submissions') {
      loadSubmissions();
    }
  }, [activeTab, loadUsers, loadHackathons, loadSubmissions]);

  const handleTabChange = (newTab) => {
    setQueryParams({
      tab: newTab,
      search: '',
      role: '',
      isBlocked: '',
      status: '',
      sortBy: 'createdAt',
      order: 'desc',
      page: 1,
    });
  };

  // Handlers for Block/Unblock
  const handleToggleBlock = async (userRecord) => {
    const actionText = userRecord.isBlocked ? 'Unblock' : 'Block';
    setModalState({
      isOpen: true,
      title: `${actionText} User Account`,
      message: `Are you sure you want to ${actionText.toLowerCase()} user "${userRecord.name}" (${userRecord.email})?`,
      confirmText: actionText,
      confirmVariant: userRecord.isBlocked ? 'primary' : 'danger',
      loading: false,
      action: async () => {
        setModalState((prev) => ({ ...prev, loading: true }));
        try {
          await adminService.toggleBlockUser(userRecord._id, !userRecord.isBlocked);
          setAlert({
            type: 'success',
            message: `User ${userRecord.name} has been ${actionText.toLowerCase()}ed successfully.`,
          });
          loadUsers();
          loadAnalytics();
        } catch (err) {
          setAlert({ type: 'error', message: err.message || 'Action failed.' });
        } finally {
          setModalState((prev) => ({ ...prev, isOpen: false, loading: false }));
        }
      },
    });
  };

  // Handlers for Role Change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setAlert({ type: 'success', message: `User role updated to ${newRole}.` });
      loadUsers();
      loadAnalytics();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update role.' });
    }
  };

  // Handlers for User Delete
  const handleDeleteUser = (userRecord) => {
    setModalState({
      isOpen: true,
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete user "${userRecord.name}" (${userRecord.email})? This action cannot be undone.`,
      confirmText: 'Delete User',
      confirmVariant: 'danger',
      loading: false,
      action: async () => {
        setModalState((prev) => ({ ...prev, loading: true }));
        try {
          await adminService.deleteUser(userRecord._id);
          setAlert({ type: 'success', message: `User ${userRecord.name} deleted.` });
          loadUsers();
          loadAnalytics();
        } catch (err) {
          setAlert({ type: 'error', message: err.message || 'Failed to delete user.' });
        } finally {
          setModalState((prev) => ({ ...prev, isOpen: false, loading: false }));
        }
      },
    });
  };

  // Handlers for Hackathon Delete
  const handleDeleteHackathon = (hackathon) => {
    setModalState({
      isOpen: true,
      title: 'Delete Hackathon',
      message: `Are you sure you want to delete hackathon "${hackathon.title}"?`,
      confirmText: 'Delete Hackathon',
      confirmVariant: 'danger',
      loading: false,
      action: async () => {
        setModalState((prev) => ({ ...prev, loading: true }));
        try {
          await adminService.deleteHackathon(hackathon._id);
          setAlert({ type: 'success', message: `Hackathon ${hackathon.title} deleted.` });
          loadHackathons();
          loadAnalytics();
        } catch (err) {
          setAlert({ type: 'error', message: err.message || 'Failed to delete hackathon.' });
        } finally {
          setModalState((prev) => ({ ...prev, isOpen: false, loading: false }));
        }
      },
    });
  };

  // Handlers for Submission Delete
  const handleDeleteSubmission = (submission) => {
    setModalState({
      isOpen: true,
      title: 'Delete Submission',
      message: `Are you sure you want to delete submission "${submission.title}"?`,
      confirmText: 'Delete Submission',
      confirmVariant: 'danger',
      loading: false,
      action: async () => {
        setModalState((prev) => ({ ...prev, loading: true }));
        try {
          await adminService.deleteSubmission(submission._id);
          setAlert({ type: 'success', message: `Submission ${submission.title} deleted.` });
          loadSubmissions();
          loadAnalytics();
        } catch (err) {
          setAlert({ type: 'error', message: err.message || 'Failed to delete submission.' });
        } finally {
          setModalState((prev) => ({ ...prev, isOpen: false, loading: false }));
        }
      },
    });
  };

  // User Columns definition for DataTable
  const userColumns = [
    {
      header: 'User',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-300">
            {row.avatar ? (
              <img
                src={row.avatar.startsWith('http') ? row.avatar : `${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}${row.avatar}`}
                alt={row.name}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              row.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-900 leading-tight">{row.name}</p>
            <p className="text-[10px] text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (row) => (
        <select
          value={row.role}
          disabled={row.role === 'admin'}
          onChange={(e) => handleRoleChange(row._id, e.target.value)}
          className="py-1 px-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 font-medium focus:outline-none focus:bg-white"
        >
          <option value="participant">Participant</option>
          <option value="organizer">Organizer</option>
          <option value="judge">Judge</option>
          <option value="admin">Admin</option>
        </select>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full border ${
            row.isBlocked
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {row.isBlocked ? 'Blocked' : 'Active'}
        </span>
      ),
    },
    {
      header: 'Joined Date',
      accessor: (row) => formatDate(row.createdAt),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          {row.role !== 'admin' && (
            <>
              <Button
                size="sm"
                variant={row.isBlocked ? 'secondary' : 'outline'}
                onClick={() => handleToggleBlock(row)}
                title={row.isBlocked ? 'Unblock user' : 'Block user'}
              >
                {row.isBlocked ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Ban className="w-3 h-3 text-amber-600" />
                )}
                <span>{row.isBlocked ? 'Unblock' : 'Block'}</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteUser(row)}
                className="text-rose-600 hover:bg-rose-50"
                title="Delete user"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Hackathons Columns
  const hackathonColumns = [
    {
      header: 'Title',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.title}</p>
          <p className="text-[10px] text-slate-500">{row.tagline || 'No tagline'}</p>
        </div>
      ),
    },
    {
      header: 'Organizer',
      accessor: (row) => row.organizer?.name || 'Unknown',
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200 rounded-full">
          {row.status}
        </span>
      ),
    },
    {
      header: 'Dates',
      accessor: (row) => `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`,
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleDeleteHackathon(row)}
          className="text-rose-600 hover:bg-rose-50"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </Button>
      ),
    },
  ];

  // Submissions Columns
  const submissionColumns = [
    {
      header: 'Project Title',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.title}</p>
          <p className="text-[10px] text-slate-500">{row.tagline}</p>
        </div>
      ),
    },
    {
      header: 'Hackathon',
      accessor: (row) => row.hackathon?.title || 'Unknown',
    },
    {
      header: 'Submitted By',
      accessor: (row) => row.submittedBy?.name || 'Unknown',
    },
    {
      header: 'Links',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-xs">
          {row.demoUrl && (
            <a
              href={row.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline flex items-center gap-0.5 text-[11px]"
            >
              Demo <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleDeleteSubmission(row)}
          className="text-rose-600 hover:bg-rose-50"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900">Admin Control Center</h1>
          <p className="text-xs text-slate-500">
            Manage users, organizers, judges, hackathons, and platform-wide configurations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
          </Button>
          <Button size="sm" variant="ghost" onClick={resetQueryParams} className="text-xs">
            Reset Filters
          </Button>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={analyticsLoading ? '...' : analytics?.users?.total || 0}
          subtitle={`${analytics?.users?.participants || 0} Participants, ${analytics?.users?.organizers || 0} Organizers`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Judges & Admins"
          value={analyticsLoading ? '...' : `${analytics?.users?.judges || 0} Judges`}
          subtitle={`${analytics?.users?.admins || 0} System Admins`}
          icon={ShieldAlert}
          color="purple"
        />
        <StatCard
          title="Total Hackathons"
          value={analyticsLoading ? '...' : analytics?.hackathons?.total || 0}
          subtitle={`${analytics?.hackathons?.active || 0} Active Ongoing`}
          icon={Trophy}
          color="emerald"
        />
        <StatCard
          title="Blocked Users"
          value={analyticsLoading ? '...' : analytics?.users?.blocked || 0}
          subtitle="Access restricted"
          icon={Ban}
          color="rose"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => handleTabChange('users')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Users Management ({analytics?.users?.total || 0})
        </button>
        <button
          onClick={() => handleTabChange('hackathons')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'hackathons'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Hackathons Management ({analytics?.hackathons?.total || 0})
        </button>
        <button
          onClick={() => handleTabChange('submissions')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Submissions ({analytics?.submissions?.total || 0})
        </button>
      </div>

      {/* Tab Content: Users Management */}
      {activeTab === 'users' && (
        <Card header={<span className="font-semibold text-xs text-slate-800">User Accounts & Roles Management</span>}>
          <DataTable
            columns={userColumns}
            data={users}
            loading={usersLoading}
            searchValue={search}
            onSearchChange={(val) => setQueryParams({ search: val, page: 1 })}
            searchPlaceholder="Search users by name, email, skills..."
            sortOptions={USER_SORT_OPTIONS}
            sortBy={sortBy}
            order={order}
            onSortChange={({ sortBy: newSort, order: newOrder }) =>
              setQueryParams({ sortBy: newSort, order: newOrder, page: 1 })
            }
            filters={[
              {
                id: 'roleFilter',
                label: 'Role',
                value: roleFilter,
                onChange: (val) => setQueryParams({ role: val, page: 1 }),
                options: [
                  { value: '', label: 'All Roles' },
                  { value: 'participant', label: 'Participant' },
                  { value: 'organizer', label: 'Organizer' },
                  { value: 'judge', label: 'Judge' },
                  { value: 'admin', label: 'Admin' },
                ],
              },
              {
                id: 'blockedFilter',
                label: 'Status',
                value: isBlockedFilter,
                onChange: (val) => setQueryParams({ isBlocked: val, page: 1 }),
                options: [
                  { value: '', label: 'All Status' },
                  { value: 'false', label: 'Active Only' },
                  { value: 'true', label: 'Blocked Only' },
                ],
              },
            ]}
            pagination={{
              ...userPagination,
              onPageChange: (newPage) => setQueryParams({ page: newPage }),
              onLimitChange: (newLimit) => setQueryParams({ limit: newLimit, page: 1 }),
            }}
          />
        </Card>
      )}

      {/* Tab Content: Hackathons Management */}
      {activeTab === 'hackathons' && (
        <Card header={<span className="font-semibold text-xs text-slate-800">Platform Hackathons Management</span>}>
          <DataTable
            columns={hackathonColumns}
            data={hackathons}
            loading={hackathonsLoading}
            searchValue={search}
            onSearchChange={(val) => setQueryParams({ search: val, page: 1 })}
            searchPlaceholder="Search hackathons by title, description..."
            sortOptions={HACKATHON_SORT_OPTIONS}
            sortBy={sortBy}
            order={order}
            onSortChange={({ sortBy: newSort, order: newOrder }) =>
              setQueryParams({ sortBy: newSort, order: newOrder, page: 1 })
            }
            filters={[
              {
                id: 'statusFilter',
                label: 'Status',
                value: statusFilter,
                onChange: (val) => setQueryParams({ status: val, page: 1 }),
                options: [
                  { value: '', label: 'All Statuses' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'upcoming', label: 'Upcoming' },
                  { value: 'ongoing', label: 'Ongoing' },
                  { value: 'ended', label: 'Ended' },
                  { value: 'cancelled', label: 'Cancelled' },
                ],
              },
            ]}
            pagination={{
              ...hackathonPagination,
              onPageChange: (newPage) => setQueryParams({ page: newPage }),
              onLimitChange: (newLimit) => setQueryParams({ limit: newLimit, page: 1 }),
            }}
          />
        </Card>
      )}

      {/* Tab Content: Submissions Management */}
      {activeTab === 'submissions' && (
        <Card header={<span className="font-semibold text-xs text-slate-800">Project Submissions</span>}>
          <DataTable
            columns={submissionColumns}
            data={submissions}
            loading={submissionsLoading}
            searchValue={search}
            onSearchChange={(val) => setQueryParams({ search: val, page: 1 })}
            searchPlaceholder="Search submissions by title..."
            sortOptions={SUBMISSION_SORT_OPTIONS}
            sortBy={sortBy}
            order={order}
            onSortChange={({ sortBy: newSort, order: newOrder }) =>
              setQueryParams({ sortBy: newSort, order: newOrder, page: 1 })
            }
            filters={[
              {
                id: 'statusFilter',
                label: 'Status',
                value: statusFilter,
                onChange: (val) => setQueryParams({ status: val, page: 1 }),
                options: [
                  { value: '', label: 'All Statuses' },
                  { value: 'submitted', label: 'Submitted' },
                  { value: 'draft', label: 'Draft' },
                ],
              },
            ]}
            pagination={{
              ...submissionPagination,
              onPageChange: (newPage) => setQueryParams({ page: newPage }),
              onLimitChange: (newLimit) => setQueryParams({ limit: newLimit, page: 1 }),
            }}
          />
        </Card>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        confirmVariant={modalState.confirmVariant}
        loading={modalState.loading}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={modalState.action}
      />
    </div>
  );
};
