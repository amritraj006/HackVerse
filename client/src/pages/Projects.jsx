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
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'

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

  // Handlers
  const handleSubmitSuccess = async (formData) => {
    await submissionService.submit(formData);
    setAlert({ type: 'success', message: 'Project submitted successfully! 🎉' });
    if (activeTab === 'all') loadAllSubmissions();
    else loadMySubmissions();
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
      setAlert({ type: 'success', message: `Submission "${deleteModal.title}" deleted.` });
      setDeleteModal({ open: false, id: null, title: '' });
      if (activeTab === 'all') loadAllSubmissions();
      else loadMySubmissions();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to delete submission.' });
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900">Projects Showcase</h1>
          <p className="text-xs text-slate-500">
            Explore hackathon submissions from builders around the world, or submit your team's project.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user && (
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
        <div className="flex items-center gap-1 border-b border-slate-200 w-full md:w-auto">
          <button
            onClick={() => {
              setActiveTab('all');
            }}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            All Submissions
          </button>
          {user && (
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
              <div className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedHackathonId}
                  onChange={(e) => handleHackathonFilterChange(e.target.value)}
                  className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white"
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
        <div className="py-12 text-center space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <FolderGit2 className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">
            {activeTab === 'all'
              ? 'No projects submitted yet matching your criteria.'
              : "You haven't submitted any projects yet."}
          </p>
          {user && activeTab === 'my' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setEditingSubmission(null);
                setIsSubmitModalOpen(true);
              }}
            >
              <Sparkles className="w-3.5 h-3.5" /> Submit Your First Project
            </Button>
          )}
        </div>
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
        onClose={() => {
          setIsSubmitModalOpen(false);
          setEditingSubmission(null);
        }}
        onSuccess={handleSubmitSuccess}
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
