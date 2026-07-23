import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import { DataTable } from '../../components/DataTable';
import { ConfirmModal } from '../../components/ConfirmModal';
import { HackathonForm } from '../../components/HackathonForm';
import { hackathonService } from '../../services/hackathonService';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/helpers';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Award,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const ManageHackathon = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [alert, setAlert] = useState({ type: 'info', message: '' });

  // Teams & Submissions
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  // Judges Assignment
  const [availableJudges, setAvailableJudges] = useState([]);
  const [selectedJudgeIds, setSelectedJudgeIds] = useState([]);
  const [isAssigningJudges, setIsAssigningJudges] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Hackathon Event Details
  useEffect(() => {
    let isMounted = true;
    hackathonService.getById(id)
      .then((res) => {
        if (isMounted && res && res.data) {
          setHackathon(res.data);
          if (res.data.assignedJudges) {
            setSelectedJudgeIds(res.data.assignedJudges.map((j) => j._id || j));
          }
        }
      })
      .catch((err) => {
        if (isMounted) setAlert({ type: 'error', message: err.message || 'Failed to load hackathon.' });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [id]);

  // Tab change effect
  useEffect(() => {
    let isMounted = true;

    if (activeTab === 'teams') {
      hackathonService.getTeams(id)
        .then((res) => { if (isMounted && res?.data) setTeams(res.data); })
        .catch((err) => console.error(err))
        .finally(() => { if (isMounted) setTeamsLoading(false); });
    }

    if (activeTab === 'judges') {
      userService.getAllUsers()
        .then((res) => {
          if (isMounted && res?.data) {
            setAvailableJudges(res.data.filter((u) => u.role === 'judge' || u.role === 'admin'));
          }
        })
        .catch((err) => console.error(err));
    }

    if (activeTab === 'submissions') {
      hackathonService.getLeaderboardPreview(id)
        .then((res) => { if (isMounted && res?.data) setLeaderboard(res.data.rankings || []); })
        .catch((err) => { if (isMounted) setAlert({ type: 'error', message: err.message || 'Failed to calculate leaderboard.' }); });
    }

    return () => { isMounted = false; };
  }, [activeTab, id]);

  // Refresh helper
  const refreshHackathonData = () => {
    hackathonService.getById(id).then((res) => {
      if (res && res.data) {
        setHackathon(res.data);
        if (res.data.assignedJudges) {
          setSelectedJudgeIds(res.data.assignedJudges.map((j) => j._id || j));
        }
      }
    });
  };

  // Toggle Registration Status
  const handleToggleRegistration = async () => {
    try {
      const newStatus = !hackathon.isRegistrationOpen;
      const res = await hackathonService.toggleRegistration(id, newStatus);
      if (res && res.data) {
        setHackathon(res.data);
        setAlert({
          type: 'success',
          message: newStatus ? 'Registrations OPENED' : 'Registrations CLOSED',
        });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to toggle registration status.' });
    }
  };

  // Edit Hackathon submit
  const handleEditSubmit = async (formData) => {
    setIsSubmittingEdit(true);
    try {
      const res = await hackathonService.update(id, formData);
      if (res && res.data) {
        setHackathon(res.data);
        setIsEditModalOpen(false);
        setAlert({ type: 'success', message: 'Hackathon updated successfully!' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update hackathon.' });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Delete Hackathon
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await hackathonService.delete(id);
      navigate('/dashboard');
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to delete hackathon.' });
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Assign Judges submit
  const handleSaveJudges = async () => {
    setIsAssigningJudges(true);
    try {
      const res = await hackathonService.assignJudges(id, selectedJudgeIds);
      if (res && res.data) {
        setHackathon(res.data);
        setAlert({ type: 'success', message: 'Judges assigned successfully!' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to assign judges.' });
    } finally {
      setIsAssigningJudges(false);
    }
  };

  // Team Approval / Rejection
  const handleTeamStatus = async (teamId, status) => {
    try {
      await hackathonService.updateTeamStatus(id, teamId, status);
      setAlert({ type: 'success', message: `Team status set to ${status}.` });
      hackathonService.getTeams(id).then((res) => { if (res?.data) setTeams(res.data); });
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update team status.' });
    }
  };

  // Publish Winners
  const handlePublishResults = async () => {
    try {
      const res = await hackathonService.publishResults(id);
      if (res && res.data) {
        setHackathon(res.data);
        setAlert({ type: 'success', message: 'Competition results published successfully!' });
        refreshHackathonData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to publish results.' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs text-slate-500 gap-2">
        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading hackathon workspace...</span>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-xs text-slate-500">Hackathon event not found.</p>
        <Link to="/dashboard">
          <Button size="sm" variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Columns for Teams table
  const teamColumns = [
    {
      header: 'Team Name',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.name}</p>
          <p className="text-[10px] text-slate-500">Join Code: {row.joinCode || 'N/A'}</p>
        </div>
      ),
    },
    {
      header: 'Leader',
      accessor: (row) => row.leader?.name || 'Unknown',
    },
    {
      header: 'Members',
      accessor: (row) => `${(row.members || []).length + 1} / ${hackathon.maxTeamSize}`,
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full border ${
            row.status === 'approved'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : row.status === 'rejected'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleTeamStatus(row._id, 'approved')}
            className="text-emerald-700 hover:bg-emerald-50"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleTeamStatus(row._id, 'rejected')}
            className="text-rose-600 hover:bg-rose-50"
          >
            <XCircle className="w-3 h-3 text-rose-600" /> Reject
          </Button>
        </div>
      ),
    },
  ];

  const leaderboardColumns = [
    {
      header: 'Rank',
      accessor: (row) => <span className="font-bold text-slate-900">#{row.rank}</span>,
    },
    { header: 'Team Name', accessor: 'teamName' },
    { header: 'Project Name', accessor: 'projectName' },
    {
      header: 'Total Score',
      accessor: (row) => <span className="font-semibold text-indigo-700">{row.totalScore} / {row.maxScore}</span>,
    },
    {
      header: 'Position',
      accessor: (row) => row.position || '—',
    },
    {
      header: 'Winner',
      accessor: (row) => row.isWinner ? <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full">🏆 Winner</span> : '—',
    },
  ];

  return (
    <div className="space-y-5">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
              {hackathon.status}
            </span>
            <span
              className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full border ${
                hackathon.isRegistrationOpen
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {hackathon.isRegistrationOpen ? 'Registrations Open' : 'Registrations Closed'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleToggleRegistration}>
              {hackathon.isRegistrationOpen ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{hackathon.isRegistrationOpen ? 'Close Registrations' : 'Open Registrations'}</span>
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="w-3.5 h-3.5" /> Edit Event
            </Button>
            <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={() => setIsDeleteModalOpen(true)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <h1 className="text-lg font-bold text-slate-900">{hackathon.title}</h1>
        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{hackathon.tagline || hackathon.description}</p>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Event Summary
        </button>
        <button
          onClick={() => setActiveTab('judges')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'judges' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Assign Judges ({(hackathon.assignedJudges || []).length})
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'teams' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Team Approvals
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'submissions' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Submissions & Results
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <Card header={<span className="font-semibold text-xs text-slate-800">Event Overview</span>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Prize Pool</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{hackathon.prizePool}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Max Team Size</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{hackathon.maxTeamSize} Members</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Start Date</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{formatDate(hackathon.startDate)}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">End Date</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{formatDate(hackathon.endDate)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Judges Assignment */}
      {activeTab === 'judges' && (
        <Card header={<span className="font-semibold text-xs text-slate-800">Assign Judges</span>}>
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Select judges from the registered platform judge pool to grade project submissions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {availableJudges.map((j) => {
                const isSelected = selectedJudgeIds.includes(j._id);
                return (
                  <div
                    key={j._id}
                    onClick={() => {
                      setSelectedJudgeIds((prev) =>
                        isSelected ? prev.filter((id) => id !== j._id) : [...prev, j._id]
                      );
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {j.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{j.name}</p>
                        <p className="text-[10px] text-slate-500">{j.email}</p>
                      </div>
                    </div>

                    <input type="checkbox" checked={isSelected} readOnly className="rounded text-indigo-600 focus:ring-indigo-500" />
                  </div>
                );
              })}
            </div>

            <Button size="sm" variant="primary" onClick={handleSaveJudges} disabled={isAssigningJudges}>
              {isAssigningJudges ? 'Saving Judges...' : 'Save Assigned Judges'}
            </Button>
          </div>
        </Card>
      )}

      {/* Tab: Teams Approval */}
      {activeTab === 'teams' && (
        <Card header={<span className="font-semibold text-xs text-slate-800">Registered Teams Approval</span>}>
          <DataTable columns={teamColumns} data={teams} loading={teamsLoading} searchPlaceholder="Search teams..." />
        </Card>
      )}

      {/* Tab: Submissions & Results */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <Card header={<span className="font-semibold text-xs text-slate-800">Calculated Leaderboard</span>}>
            <div className="space-y-3 text-xs">
              <p className="text-slate-500">
                Rankings use each project&apos;s average score from all submitted judge evaluations. Publishing awards the top three ranked projects automatically.
              </p>
              <DataTable columns={leaderboardColumns} data={leaderboard} searchPlaceholder="Search rankings..." />
              <Button size="sm" variant="primary" onClick={handlePublishResults} disabled={!leaderboard.length || hackathon.isResultsPublished}>
                <Award className="w-3.5 h-3.5" /> Publish Official Results
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Form Modal */}
      <HackathonForm
        isOpen={isEditModalOpen}
        initialData={hackathon}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmittingEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Hackathon Event"
        message={`Are you sure you want to delete "${hackathon.title}"? All submissions, registrations, and data will be permanently removed.`}
        confirmText="Delete Hackathon"
        confirmVariant="danger"
        loading={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
