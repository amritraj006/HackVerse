import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import { DataTable } from '../../components/DataTable';
import { ConfirmModal } from '../../components/ConfirmModal';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/helpers';
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

export const AdminConsole = () => {
  const [activeTab, setActiveTab] = useState('users');

  // State: Analytics
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // State: Users Table
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userBlockedFilter, setUserBlockedFilter] = useState('');
  const [userPagination, setUserPagination] = useState({ page: 1, limit: 10, pages: 1, total: 0 });

  // State: Hackathons Table
  const [hackathons, setHackathons] = useState([]);
  const [hackathonsLoading, setHackathonsLoading] = useState(false);
  const [hackathonSearch, setHackathonSearch] = useState('');
  const [hackathonPagination, setHackathonPagination] = useState({ page: 1, limit: 10, pages: 1, total: 0 });

  // State: Submissions Table
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [submissionPagination, setSubmissionPagination] = useState({ page: 1, limit: 10, pages: 1, total: 0 });

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
  const loadUsers = useCallback(async (page = 1) => {
    try {
      const res = await adminService.getUsers({
        page,
        limit: 10,
        search: userSearch,
        role: userRoleFilter,
        isBlocked: userBlockedFilter,
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
  }, [userSearch, userRoleFilter, userBlockedFilter]);

  // Fetch Hackathons
  const loadHackathons = useCallback(async (page = 1) => {
    try {
      const res = await adminService.getHackathons({
        page,
        limit: 10,
        search: hackathonSearch,
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
  }, [hackathonSearch]);

  // Fetch Submissions
  const loadSubmissions = useCallback(async (page = 1) => {
    try {
      const res = await adminService.getSubmissions({
        page,
        limit: 10,
        search: submissionSearch,
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
  }, [submissionSearch]);

  useEffect(() => {
    let isMounted = true;
    adminService.getAnalytics()
      .then((res) => {
        if (isMounted && res && res.data) {
          setAnalytics(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setAnalyticsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (activeTab === 'users') {
      adminService.getUsers({
        page: userPagination.page || 1,
        limit: 10,
        search: userSearch,
        role: userRoleFilter,
        isBlocked: userBlockedFilter,
      }).then((res) => {
        if (isMounted && res && res.data) {
          setUsers(res.data.users);
          setUserPagination(res.data.pagination);
        }
      }).catch((err) => setAlert({ type: 'error', message: err.message || 'Failed to load users' }))
        .finally(() => { if (isMounted) setUsersLoading(false); });
    }

    if (activeTab === 'hackathons') {
      adminService.getHackathons({
        page: hackathonPagination.page || 1,
        limit: 10,
        search: hackathonSearch,
      }).then((res) => {
        if (isMounted && res && res.data) {
          setHackathons(res.data.hackathons);
          setHackathonPagination(res.data.pagination);
        }
      }).catch((err) => setAlert({ type: 'error', message: err.message || 'Failed to load hackathons' }))
        .finally(() => { if (isMounted) setHackathonsLoading(false); });
    }

    if (activeTab === 'submissions') {
      adminService.getSubmissions({
        page: submissionPagination.page || 1,
        limit: 10,
        search: submissionSearch,
      }).then((res) => {
        if (isMounted && res && res.data) {
          setSubmissions(res.data.submissions);
          setSubmissionPagination(res.data.pagination);
        }
      }).catch((err) => setAlert({ type: 'error', message: err.message || 'Failed to load submissions' }))
        .finally(() => { if (isMounted) setSubmissionsLoading(false); });
    }

    return () => { isMounted = false; };
  }, [activeTab, userSearch, userRoleFilter, userBlockedFilter, hackathonSearch, submissionSearch, userPagination.page, hackathonPagination.page, submissionPagination.page]);

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
          loadUsers(userPagination.page);
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
      loadUsers(userPagination.page);
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
          loadUsers(userPagination.page);
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
          loadHackathons(hackathonPagination.page);
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
          loadSubmissions(submissionPagination.page);
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
                onError={(e) => { e.target.style.display = 'none'; }}
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
        <Button size="sm" variant="outline" onClick={loadAnalytics}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
        </Button>
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
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Users Management ({analytics?.users?.total || 0})
        </button>
        <button
          onClick={() => setActiveTab('hackathons')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'hackathons'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Hackathons Management ({analytics?.hackathons?.total || 0})
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
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
            searchValue={userSearch}
            onSearchChange={setUserSearch}
            searchPlaceholder="Search users by name or email..."
            filters={[
              {
                id: 'roleFilter',
                label: 'Role',
                value: userRoleFilter,
                onChange: (val) => setUserRoleFilter(val),
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
                value: userBlockedFilter,
                onChange: (val) => setUserBlockedFilter(val),
                options: [
                  { value: '', label: 'All Status' },
                  { value: 'false', label: 'Active Only' },
                  { value: 'true', label: 'Blocked Only' },
                ],
              },
            ]}
            pagination={{
              ...userPagination,
              onPageChange: (newPage) => loadUsers(newPage),
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
            searchValue={hackathonSearch}
            onSearchChange={setHackathonSearch}
            searchPlaceholder="Search hackathons by title..."
            pagination={{
              ...hackathonPagination,
              onPageChange: (newPage) => loadHackathons(newPage),
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
            searchValue={submissionSearch}
            onSearchChange={setSubmissionSearch}
            searchPlaceholder="Search submissions..."
            pagination={{
              ...submissionPagination,
              onPageChange: (newPage) => loadSubmissions(newPage),
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
