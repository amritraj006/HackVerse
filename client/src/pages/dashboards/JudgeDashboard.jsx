import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import { submissionService } from '../../services/submissionService';
import { hackathonService } from '../../services/hackathonService';
import { notificationService } from '../../services/notificationService';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Scale,
  Star,
  X,
  Check,
  XCircle,
  Inbox,
  Trophy,
  Users,
  User,
  ShieldCheck,
  Building,
} from 'lucide-react';

const initialScores = (criteria) => Object.fromEntries(criteria.map(({ criterion }) => [criterion, '']));

export const JudgeDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('evaluations');
  const [submissions, setSubmissions] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [scores, setScores] = useState({});
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: 'info', message: '' });

  // Judge Hackathon context (teams, solo participants, hackathon details)
  const [judgeHackathons, setJudgeHackathons] = useState([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState('');
  const [hackathonViewData, setHackathonViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Winner declaration state
  const [declaringWinnerId, setDeclaringWinnerId] = useState(null);

  // Pending judge invites
  const [pendingInvites, setPendingInvites] = useState([]);
  const [inviteActionId, setInviteActionId] = useState(null);

  const loadPendingInvites = useCallback(async () => {
    try {
      const res = await notificationService.getAll();
      const invites = (res?.data || []).filter(
        (n) => n.type === 'judge_invite' && n.status === 'pending'
      );
      setPendingInvites(invites);
    } catch {
      // silently ignore
    }
  }, []);

  const loadAssignedSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await submissionService.getAssigned();
      const subs = res?.data?.submissions || [];
      setSubmissions(subs);
      setCriteria(res?.data?.criteria || []);

      // Extract unique hackathon IDs from assigned submissions
      const uniqueHackathons = [];
      const hackathonMap = new Map();
      subs.forEach((sub) => {
        if (sub.hackathon && sub.hackathon._id && !hackathonMap.has(sub.hackathon._id)) {
          hackathonMap.set(sub.hackathon._id, sub.hackathon);
          uniqueHackathons.push(sub.hackathon);
        }
      });
      setJudgeHackathons(uniqueHackathons);
      if (uniqueHackathons.length > 0 && !selectedHackathonId) {
        setSelectedHackathonId(uniqueHackathons[0]._id);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Could not load your assigned projects.' });
    } finally {
      setLoading(false);
    }
  }, [selectedHackathonId]);

  const loadHackathonView = useCallback(async (hackathonId) => {
    if (!hackathonId) return;
    setViewLoading(true);
    try {
      const res = await hackathonService.getJudgeView(hackathonId);
      setHackathonViewData(res?.data || null);
    } catch (err) {
      console.error('Failed to load judge view for hackathon:', err);
    } finally {
      setViewLoading(false);
    }
  }, []);


  useEffect(() => {
    loadAssignedSubmissions();
    loadPendingInvites();
  }, [loadAssignedSubmissions, loadPendingInvites]);

  useEffect(() => {
    if (selectedHackathonId) {
      loadHackathonView(selectedHackathonId);
    }
  }, [selectedHackathonId, loadHackathonView]);

  const handleAcceptInvite = async (notifId) => {
    setInviteActionId(notifId);
    try {
      await notificationService.acceptInvitation(notifId);
      setPendingInvites((prev) => prev.filter((n) => n._id !== notifId));
      setAlert({ type: 'success', message: 'You have accepted the judge invitation! You can now evaluate projects and view hackathon details.' });
      await loadAssignedSubmissions();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to accept invitation' });
    } finally {
      setInviteActionId(null);
    }
  };

  const handleDeclineInvite = async (notifId) => {
    setInviteActionId(notifId);
    try {
      await notificationService.rejectInvitation(notifId);
      setPendingInvites((prev) => prev.filter((n) => n._id !== notifId));
      setAlert({ type: 'info', message: 'You have declined the judge invitation.' });
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to decline invitation' });
    } finally {
      setInviteActionId(null);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadAssignedSubmissions(), loadPendingInvites()]);
    if (selectedHackathonId) {
      await loadHackathonView(selectedHackathonId);
    }
  };

  const submitEvaluation = async (event) => {
    event.preventDefault();
    const missingScore = criteria.some(({ criterion }) => scores[criterion] === '' || scores[criterion] === undefined);
    if (missingScore) {
      setAlert({ type: 'error', message: 'Give every criterion a score before submitting.' });
      return;
    }
    if (!feedback.trim()) {
      setAlert({ type: 'error', message: 'Please include constructive feedback.' });
      return;
    }

    setSubmitting(true);
    try {
      await submissionService.submitEvaluation(selectedSubmission._id, {
        criteriaScores: criteria.map(({ criterion }) => ({ criterion, score: Number(scores[criterion]) })),
        feedback,
      });
      setAlert({ type: 'success', message: `Evaluation submitted — total score: ${totalScore}/${maximumScore}.` });
      setSelectedSubmission(null);
      await loadAssignedSubmissions();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Could not submit the evaluation.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeclareWinner = async (submissionId, projectTitle, teamOrSoloName) => {
    if (!window.confirm(`Are you sure you want to declare "${projectTitle}" (${teamOrSoloName}) as the Official Winner?\n\nThis will update all team members' user profiles with the victory badge!`)) {
      return;
    }

    setDeclaringWinnerId(submissionId);
    try {
      await submissionService.declareWinner(submissionId);
      setAlert({
        type: 'success',
        message: `🏆 "${projectTitle}" has been declared the WINNER! Victory status updated for all team members!`,
      });
      await loadAssignedSubmissions();
      if (selectedHackathonId) {
        await loadHackathonView(selectedHackathonId);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to declare winner.' });
    } finally {
      setDeclaringWinnerId(null);
    }
  };

  const evaluated = submissions.filter((sub) => sub.myEvaluation);
  const pendingQueue = submissions.filter((sub) => !sub.myEvaluation);
  const averageRating = evaluated.length
    ? (evaluated.reduce((sum, sub) => sum + (sub.myEvaluation?.score || 0), 0) / evaluated.length).toFixed(1)
    : '—';
  const totalScore = useMemo(
    () => criteria.reduce((sum, { criterion }) => sum + (Number(scores[criterion]) || 0), 0),
    [criteria, scores]
  );
  const maximumScore = criteria.reduce((sum, item) => sum + item.maxScore, 0);

  const openEvaluation = (submission) => {
    setSelectedSubmission(submission);
    setScores(initialScores(criteria));
    setFeedback('');
  };

  const closeEvaluation = () => {
    if (!submitting) setSelectedSubmission(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Judge Evaluation & Control Portal — {user?.name || 'Judge'} ⚖️
          </h1>
          <p className="text-xs text-slate-500">
            Evaluate project submissions, review hackathon teams and members, and declare official winners.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Portal
        </Button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

      {/* Pending Judge Invitations */}
      {pendingInvites.length > 0 && (
        <Card header={
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-xs text-slate-800">Pending Judge Invitations ({pendingInvites.length})</span>
          </div>
        }>
          <div className="space-y-3">
            {pendingInvites.map((invite) => {
              const isActing = inviteActionId === invite._id;
              return (
                <div key={invite._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{invite.hackathon?.title || invite.title}</p>
                    <p className="text-[11px] text-slate-500">{invite.message}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAcceptInvite(invite._id)}
                      disabled={isActing}
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-[11px] font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {isActing ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> : <Check className="w-3 h-3" />}
                      Accept Role
                    </button>
                    <button
                      onClick={() => handleDeclineInvite(invite._id)}
                      disabled={isActing}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-semibold rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3 h-3" /> Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Projects" value={loading ? '...' : submissions.length} subtitle="Across assigned hackathons" icon={Scale} color="indigo" />
        <StatCard title="Evaluated" value={loading ? '...' : evaluated.length} subtitle={submissions.length ? `${Math.round((evaluated.length / submissions.length) * 100)}% complete` : 'No projects assigned'} icon={CheckCircle2} color="emerald" />
        <StatCard title="Pending Grading" value={loading ? '...' : pendingQueue.length} subtitle="Awaiting your review" icon={Clock} color="amber" />
        <StatCard title="Average Rating" value={loading || averageRating === '—' ? averageRating : `${averageRating} / ${maximumScore}`} subtitle="Your completed reviews" icon={Star} color="purple" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('evaluations')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'evaluations' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-3.5 h-3.5" /> Project Evaluations ({submissions.length})
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'details' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Hackathon Members & Teams
        </button>
        <button
          onClick={() => setActiveTab('winners')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'winners' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-600" /> Declare Winner
        </button>
      </div>

      {/* Tab 1: Project Evaluations */}
      {activeTab === 'evaluations' && (
        <Card header={<span className="font-semibold text-xs text-slate-800">Assigned Project Queue</span>}>
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading your assigned projects...</div>
          ) : submissions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No projects have been assigned to you yet. Accept a judge invitation to begin evaluating.</div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => {
                const reviewed = Boolean(submission.myEvaluation);
                const isWinner = submission.isWinner;
                return (
                  <div key={submission._id} className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${isWinner ? 'bg-amber-50/60 border-amber-200 ring-1 ring-amber-300' : 'bg-slate-50 border-slate-200/80'}`}>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isWinner && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> OFFICIAL WINNER
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${reviewed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {reviewed ? `Reviewed: ${submission.myEvaluation.score}/${maximumScore}` : 'Pending Review'}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900 truncate">{submission.title}</h3>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {submission.hackathon?.title || 'Hackathon'} • {submission.team ? `Team: ${submission.team.name}` : `Solo: ${submission.submittedBy?.name || 'Individual'}`}
                      </p>
                      {submission.tagline && <p className="text-[11px] text-slate-500 truncate">{submission.tagline}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {submission.demoUrl && (
                        <a href={submission.demoUrl} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline"><ExternalLink className="w-3.5 h-3.5" /> View Demo</Button>
                        </a>
                      )}
                      <Button size="sm" variant={reviewed ? 'secondary' : 'primary'} disabled={reviewed} onClick={() => openEvaluation(submission)}>
                        {reviewed ? 'Evaluation Submitted' : 'Evaluate Project'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Tab 2: Hackathon Details, Members & Teams */}
      {activeTab === 'details' && (
        <div className="space-y-4">
          {/* Hackathon Selector if multiple */}
          {judgeHackathons.length > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700">Select Hackathon:</span>
              <select
                value={selectedHackathonId}
                onChange={(e) => setSelectedHackathonId(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white font-medium text-slate-800"
              >
                {judgeHackathons.map((h) => (
                  <option key={h._id} value={h._id}>{h.title}</option>
                ))}
              </select>
            </div>
          )}

          {viewLoading ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading hackathon members and teams...</div>
          ) : !hackathonViewData ? (
            <div className="py-8 text-center text-xs text-slate-500">No hackathon details available. Accept an invitation first.</div>
          ) : (
            <div className="space-y-4">
              {/* Hackathon Overview Header */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">{hackathonViewData.hackathon.title}</h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                    {hackathonViewData.hackathon.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{hackathonViewData.hackathon.tagline || hackathonViewData.hackathon.description}</p>
                <div className="flex flex-wrap gap-4 text-xs pt-1 text-slate-600 border-t border-slate-100 mt-2">
                  <span><strong>Registered Users:</strong> {hackathonViewData.hackathon.totalRegisteredUsers || 0}</span>
                  <span><strong>Teams:</strong> {hackathonViewData.teams?.length || 0}</span>
                  <span><strong>Solo Participants:</strong> {hackathonViewData.soloParticipants?.length || 0}</span>
                  <span><strong>Submissions:</strong> {hackathonViewData.submissions?.length || 0}</span>
                </div>
              </div>

              {/* Teams breakdown */}
              <Card header={
                <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-500" /> Hackathon Teams ({hackathonViewData.teams?.length || 0})
                </span>
              }>
                {hackathonViewData.teams?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No teams formed yet in this hackathon.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {hackathonViewData.teams.map((t) => (
                      <div key={t._id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border ${t.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {t.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-indigo-600" /> Leader: <span className="font-semibold text-slate-800">{t.leader?.name || 'Unknown'}</span> ({t.leader?.email})
                          </p>
                          {(t.members || []).length > 0 && (
                            <div className="pt-1 border-t border-slate-200/60">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase">Members:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {t.members.map((m) => (
                                  <span key={m._id} className="px-2 py-0.5 text-[10px] bg-white border border-slate-200 text-slate-700 rounded-md">
                                    {m.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Solo Participants breakdown */}
              <Card header={
                <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" /> Solo Registered Participants ({hackathonViewData.soloParticipants?.length || 0})
                </span>
              }>
                {hackathonViewData.soloParticipants?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No solo participants registered for this hackathon.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {hackathonViewData.soloParticipants.map((reg) => (
                      <div key={reg._id} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {reg.participant?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{reg.participant?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-slate-500 truncate">{reg.participant?.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Declare Winner */}
      {activeTab === 'winners' && (
        <Card header={
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-xs text-slate-800">Declare Official Winner</span>
          </div>
        }>
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              As the assigned judge, you have authority to declare the winning project for your hackathon.
              Declaring a winner will instantly propagate victory badges to <strong>all members of the team</strong> (or the solo participant) across the entire platform.
            </p>

            {submissions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No project submissions available to declare as winner.</div>
            ) : (
              <div className="space-y-3">
                {submissions.map((submission) => {
                  const isWinner = submission.isWinner;
                  const isActing = declaringWinnerId === submission._id;
                  const teamOrSoloName = submission.team ? `Team: ${submission.team.name}` : `Solo: ${submission.submittedBy?.name || 'Participant'}`;

                  return (
                    <div
                      key={submission._id}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                        isWinner ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/40' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isWinner && (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full flex items-center gap-1 shadow-xs">
                              <Trophy className="w-3 h-3" /> OFFICIAL WINNER
                            </span>
                          )}
                          <h3 className="text-xs font-bold text-slate-900">{submission.title}</h3>
                        </div>
                        <p className="text-[11px] font-medium text-slate-600">{teamOrSoloName}</p>
                        <p className="text-[11px] text-slate-500">
                          Average Score: <span className="font-bold text-indigo-700">{submission.score || 0} / 40</span>
                          {submission.myEvaluation && <span className="ml-2 text-emerald-600 font-semibold">(Your Grade: {submission.myEvaluation.score}/40)</span>}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isWinner ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-900 text-xs font-bold rounded-lg border border-amber-300">
                            <Trophy className="w-3.5 h-3.5 text-amber-600" /> Declared Winner
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={isActing}
                            onClick={() => handleDeclareWinner(submission._id, submission.title, teamOrSoloName)}
                            className="bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                          >
                            {isActing ? (
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                            ) : (
                              <Trophy className="w-3.5 h-3.5" />
                            )}
                            Declare Winner 🏆
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Evaluation Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="evaluation-title">
          <form onSubmit={submitEvaluation} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-3">
              <div>
                <h2 id="evaluation-title" className="text-sm font-bold text-slate-900">Evaluate {selectedSubmission.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Score each criterion from 0 to its maximum. Total is calculated automatically.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={closeEvaluation} disabled={submitting} aria-label="Close evaluation"><X className="w-4 h-4" /></Button>
            </div>
            <div className="p-5 space-y-4">
              {criteria.map(({ criterion, maxScore }) => (
                <div key={criterion} className="grid grid-cols-[1fr_100px] items-center gap-4">
                  <label htmlFor={`score-${criterion}`} className="text-xs font-semibold text-slate-700">{criterion} <span className="font-normal text-slate-400">/ {maxScore}</span></label>
                  <input id={`score-${criterion}`} type="number" min="0" max={maxScore} step="1" required value={scores[criterion] ?? ''} onChange={(event) => setScores((current) => ({ ...current, [criterion]: event.target.value }))} className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              ))}
              <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-2 text-xs">
                <span className="font-semibold text-indigo-900">Total score</span>
                <span className="font-bold text-indigo-700">{totalScore} / {maximumScore}</span>
              </div>
              <div className="space-y-1">
                <label htmlFor="judge-feedback" className="block text-xs font-semibold text-slate-700">Feedback <span className="text-rose-500">*</span></label>
                <textarea id="judge-feedback" required rows="4" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Share specific strengths and actionable suggestions..." className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2">
              <Button variant="outline" onClick={closeEvaluation} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Evaluation'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

