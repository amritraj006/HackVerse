import { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { SubmissionCard } from '../components/SubmissionCard';
import { SubmissionModal } from '../components/SubmissionModal';
import { SubmissionDetailModal } from '../components/SubmissionDetailModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { SearchBar } from '../components/SearchBar';
import { SortDropdown } from '../components/SortDropdown';
import { PaginationControls } from '../components/PaginationControls';
import { submissionService } from '../services/submissionService';
import { hackathonService } from '../services/hackathonService';
import { useAuth } from '../hooks/useAuth';
import { useQueryParams } from '../hooks/useQueryParams';
import { notify } from '../utils/toast';
import { EmptyState } from '../components/EmptyState';
import {
  FolderGit2,
  Plus,
  Filter,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Recently Submitted' },
  { value: 'score', label: 'Score' },
  { value: 'title', label: 'Project Name' },
];

const DEFAULT_PARAMS = {
  search: '',
  hackathonId: '',
  sortBy: 'createdAt',
  order: 'desc',
  page: '1',
  limit: '12',
};

export const Projects = () => {
  const { user } = useAuth();
  const isParticipantOnly = user && user.role === 'participant';
  const [activeTab, setActiveTab] = useState(isParticipantOnly ? 'my' : 'all'); // 'all' or 'my'


  const [queryParams, setQueryParams, resetQueryParams] = useQueryParams(DEFAULT_PARAMS);

  const search = queryParams.search || '';
  const selectedHackathonId = queryParams.hackathonId || '';
  const sortBy = queryParams.sortBy || 'createdAt';
  const order = queryParams.order || 'desc';
  const page = parseInt(queryParams.page || '1', 10);
  const limit = parseInt(queryParams.limit || '12', 10);

  const [submissions, setSubmissions] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [hackathons, setHackathons] = useState([]);

  const [pagination, setPagination] = useState({ page, pages: 1, total: 0, limit });

  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: 'info', message: '' });

  // Modal States
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState(null);

  const [selectedDetailSubmission, setSelectedDetailSubmission] = useState(null);

  // Delete Confirm Modal
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Hackathons for filtering
  useEffect(() => {
    let isMounted = true;
    hackathonService
      .getAll({ limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        setHackathons(res?.data?.hackathons || res?.data || []);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch showcase submissions
  const loadAllSubmissions = useCallback(() => {
    setLoading(true);
    submissionService
      .getAll({
        search,
        hackathonId: selectedHackathonId,
        sortBy,
        order,
        page,
        limit,
      })
      .then((res) => {
        if (res?.data) {
          setSubmissions(res.data.submissions || []);
          if (res.data.pagination) setPagination(res.data.pagination);
        }
      })
      .catch((err) => {
        setAlert({ type: 'error', message: err.message || 'Failed to load projects.' });
      })
      .finally(() => setLoading(false));
  }, [search, selectedHackathonId, sortBy, order, page, limit]);

  // Fetch my submissions
  const loadMySubmissions = useCallback(() => {
    if (!user) return;
    setLoading(true);
    submissionService
      .getMySubmissions()
      .then((res) => {
        if (res?.data) setMySubmissions(res.data);
      })
      .catch((err) => {
        setAlert({ type: 'error', message: err.message || 'Failed to load my submissions.' });
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (activeTab === 'all') {
      loadAllSubmissions();
    } else if (user) {
      loadMySubmissions();
    }
  }, [activeTab, loadAllSubmissions, loadMySubmissions, user]);

  // Always keep mySubmissions fresh for the duplicate-submission guard in the modal
  useEffect(() => {
    if (user) loadMySubmissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Handlers
  const handleSubmitSuccess = async (formData) => {
    if (editingSubmission) {
      await submissionService.update(editingSubmission._id, formData);
      const msg = 'Project updated successfully! ✏️';
      setAlert({ type: 'success', message: msg });
      notify.success('Project Updated! 🚀', 'Your project changes have been saved.');
    } else {
      await submissionService.submit(formData);
      const msg = 'Project submitted successfully! 🎉';
      setAlert({ type: 'success', message: msg });
      notify.success('Project Submitted! 🚀', 'Your hackathon entry has been registered.');
    }
    if (activeTab === 'all') loadAllSubmissions();
    else loadMySubmissions();
    // Always refresh mySubmissions so the duplicate guard stays current
    if (user && activeTab === 'all') loadMySubmissions();
  };

  const handleOpenEdit = (sub) => {
    setEditingSubmission(sub);
    setIsSubmitModalOpen(true);
  };

  const handleDeleteOpen = (id, title) => {
    setDeleteModal({ open: true, id, title });
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await submissionService.deleteSubmission(deleteModal.id);
      const msg = `Submission "${deleteModal.title}" deleted.`;
      setAlert({ type: 'success', message: msg });
      notify.info('Submission Removed', msg);
      setDeleteModal({ open: false, id: null, title: '' });
      if (activeTab === 'all') loadAllSubmissions();
      else loadMySubmissions();
      // Always refresh mySubmissions so the duplicate guard stays current
      if (user && activeTab === 'all') loadMySubmissions();
    } catch (err) {
      const errText = err.message || 'Failed to delete submission.';
      setAlert({ type: 'error', message: errText });
      notify.error('Delete Failed', errText);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearchChange = (val) => {
    setQueryParams({ search: val, page: 1 });
  };

  const handleHackathonFilterChange = (hId) => {
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

  const displayList = activeTab === 'all' ? submissions : mySubmissions;

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
        <div>
          <h1 className="text-base font-bold text-[var(--ink-heading)]">Projects Showcase</h1>
          <p className="text-xs text-[var(--muted)]">
            Explore hackathon submissions from builders around the world, or submit your team's project.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user && user.role === 'participant' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setEditingSubmission(null);
                setIsSubmitModalOpen(true);
              }}
            >
              <Plus className="w-3.5 h-3.5" /> Submit Project
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={activeTab === 'all' ? loadAllSubmissions : loadMySubmissions}
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          </Button>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

      {/* Tabs & Search/Filter Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 border-b border-[var(--line)] w-full md:w-auto">
          {!isParticipantOnly && (
            <button
              onClick={() => {
                setActiveTab('all');
              }}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'border-indigo-500 text-indigo-500'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              All Submissions
            </button>
          )}
          {user && (
            <button
              onClick={() => {
                setActiveTab('my');
              }}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'my'
                  ? 'border-indigo-500 text-indigo-500'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              My Submissions ({mySubmissions.length})
            </button>
          )}
        </div>

        {/* Showcase Controls (All Submissions tab) */}
        {activeTab === 'all' && (
          <div className="flex flex-wrap items-center gap-2.5 flex-1 md:justify-end">
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              placeholder="Search project titles, taglines..."
              loading={loading}
              className="w-full sm:w-60"
            />

            {hackathons.length > 0 && (
              <div className="flex items-center gap-1 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedHackathonId}
                  onChange={(e) => handleHackathonFilterChange(e.target.value)}
                  className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-800 w-full sm:w-auto max-w-full sm:max-w-xs truncate"
                >
                  <option value="">All Hackathons</option>
                  {hackathons.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <SortDropdown
              options={SORT_OPTIONS}
              sortBy={sortBy}
              order={order}
              onSortChange={handleSortChange}
            />

            {(search || selectedHackathonId) && (
              <Button size="sm" variant="ghost" onClick={resetQueryParams} className="text-xs">
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Showcase Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-xs text-slate-500 gap-2">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading projects...</span>
        </div>
      ) : displayList.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          badgeText={activeTab === 'all' ? 'SHOWCASE // ZERO_ENTRIES' : 'PROJECTS // NO_SUBMISSIONS'}
          title={activeTab === 'all' ? 'No Projects in the Showcase' : 'No Submissions Filed Yet'}
          description={
            activeTab === 'all'
              ? 'No projects have been submitted for the selected hackathon or filter criteria yet. Check back when the arena closes.'
              : 'You haven\'t submitted any projects yet. Create your first entry to compete in an active hackathon arena.'
          }
          action={
            user && activeTab === 'my' ? (
              <Button
                size="md"
                variant="primary"
                onClick={() => {
                  setEditingSubmission(null);
                  setIsSubmitModalOpen(true);
                }}
              >
                <Sparkles className="w-4 h-4" /> Submit Your First Project
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayList.map((sub) => (
            <SubmissionCard
              key={sub._id}
              submission={sub}
              currentUserId={user?._id || user?.id}
              onView={(s) => setSelectedDetailSubmission(s)}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteOpen}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && activeTab === 'all' && (
        <PaginationControls
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          limitOptions={[6, 12, 24, 48]}
        />
      )}

      {/* Modals */}
      <SubmissionModal
        isOpen={isSubmitModalOpen}
        submission={editingSubmission}
        mySubmissions={mySubmissions}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setEditingSubmission(null);
        }}
        onSuccess={handleSubmitSuccess}
        onEditExisting={(sub) => {
          setIsSubmitModalOpen(false);
          setTimeout(() => {
            setEditingSubmission(sub);
            setIsSubmitModalOpen(true);
          }, 50);
        }}
      />

      <SubmissionDetailModal
        isOpen={!!selectedDetailSubmission}
        submission={selectedDetailSubmission}
        onClose={() => setSelectedDetailSubmission(null)}
      />

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Project Submission"
        message={`Are you sure you want to delete "${deleteModal.title}"?`}
        confirmText="Delete Submission"
        confirmVariant="danger"
        loading={isDeleting}
        onClose={() => setDeleteModal({ open: false, id: null, title: '' })}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
