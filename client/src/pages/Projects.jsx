import { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { SubmissionCard } from '../components/SubmissionCard';
import { SubmissionModal } from '../components/SubmissionModal';
import { SubmissionDetailModal } from '../components/SubmissionDetailModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { submissionService } from '../services/submissionService';
import { hackathonService } from '../services/hackathonService';
import { useAuth } from '../hooks/useAuth';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const Projects = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'

  const [submissions, setSubmissions] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState('');

  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

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
    hackathonService.getAll({ limit: 50 })
      .then((res) => {
        if (!isMounted) return;
        setHackathons(res?.data?.hackathons || res?.data || []);
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  // Load All Showcase Submissions
  const loadAllSubmissions = useCallback(() => {
    let isMounted = true;
    submissionService.getAll({
      search,
      hackathonId: selectedHackathonId,
      page: pagination.page,
      limit: 12,
    })
      .then((res) => {
        if (isMounted && res?.data) {
          setSubmissions(res.data.submissions || []);
          if (res.data.pagination) setPagination(res.data.pagination);
        }
      })
      .catch((err) => {
        if (isMounted) setAlert({ type: 'error', message: err.message || 'Failed to load projects.' });
      })
      .finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [search, selectedHackathonId, pagination.page]);

  // Load My Submissions
  const loadMySubmissions = useCallback(() => {
    if (!user) return () => {};
    let isMounted = true;
    submissionService.getMySubmissions()
      .then((res) => {
        if (isMounted && res?.data) setMySubmissions(res.data);
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'all') {
      submissionService.getAll({
        search,
        hackathonId: selectedHackathonId,
        page: pagination.page,
        limit: 12,
      })
        .then((res) => {
          if (isMounted && res?.data) {
            setSubmissions(res.data.submissions || []);
            if (res.data.pagination) setPagination(res.data.pagination);
          }
        })
        .catch((err) => {
          if (isMounted) setAlert({ type: 'error', message: err.message || 'Failed to load projects.' });
        })
        .finally(() => { if (isMounted) setLoading(false); });
    } else if (user) {
      submissionService.getMySubmissions()
        .then((res) => {
          if (isMounted && res?.data) setMySubmissions(res.data);
        })
        .catch(() => {})
        .finally(() => { if (isMounted) setLoading(false); });
    }
    return () => { isMounted = false; };
  }, [activeTab, search, selectedHackathonId, pagination.page, user]);

  // Submit / Edit Action
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

  // Delete Action
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

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 border-b border-slate-200 w-full sm:w-auto">
          <button
            onClick={() => { setActiveTab('all'); setLoading(true); }}
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
              onClick={() => { setActiveTab('my'); setLoading(true); }}
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

        {/* Search & Filter Inputs (Showcase tab) */}
        {activeTab === 'all' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPagination((prev) => ({ ...prev, page: 1 })); }}
                placeholder="Search projects..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white"
              />
            </div>

            {hackathons.length > 0 && (
              <div className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedHackathonId}
                  onChange={(e) => { setSelectedHackathonId(e.target.value); setPagination((prev) => ({ ...prev, page: 1 })); }}
                  className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white"
                >
                  <option value="">All Hackathons</option>
                  {hackathons.map((h) => (
                    <option key={h._id} value={h._id}>{h.title}</option>
                  ))}
                </select>
              </div>
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
              ? 'No projects submitted yet for the selected criteria.'
              : "You haven't submitted any projects yet."}
          </p>
          {user && activeTab === 'my' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => { setEditingSubmission(null); setIsSubmitModalOpen(true); }}
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

      {/* Pagination (All tab) */}
      {!loading && activeTab === 'all' && pagination.pages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
          <span>
            Page <span className="font-semibold text-slate-700">{pagination.page}</span> of{' '}
            <span className="font-semibold text-slate-700">{pagination.pages}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              ← Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <SubmissionModal
        isOpen={isSubmitModalOpen}
        submission={editingSubmission}
        onClose={() => { setIsSubmitModalOpen(false); setEditingSubmission(null); }}
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
