import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import { submissionService } from '../../services/submissionService';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Scale,
  Star,
  X,
} from 'lucide-react';

const initialScores = (criteria) => Object.fromEntries(criteria.map(({ criterion }) => [criterion, '']));

export const JudgeDashboard = ({ user }) => {
  const [submissions, setSubmissions] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [scores, setScores] = useState({});
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: 'info', message: '' });

  const loadAssignedSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await submissionService.getAssigned();
      setSubmissions(res?.data?.submissions || []);
      setCriteria(res?.data?.criteria || []);
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Could not load your assigned projects.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    submissionService.getAssigned()
      .then((res) => {
        if (!isMounted) return;
        setSubmissions(res?.data?.submissions || []);
        setCriteria(res?.data?.criteria || []);
      })
      .catch((err) => {
        if (isMounted) setAlert({ type: 'error', message: err.message || 'Could not load your assigned projects.' });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const evaluated = submissions.filter((submission) => submission.myEvaluation);
  const pending = submissions.filter((submission) => !submission.myEvaluation);
  const averageRating = evaluated.length
    ? (evaluated.reduce((sum, submission) => sum + (submission.myEvaluation?.score || 0), 0) / evaluated.length).toFixed(1)
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

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900">Judge Evaluation Portal — {user?.name || 'Judge'} ⚖️</h1>
          <p className="text-xs text-slate-500">Review assigned projects using the shared 40-point rubric and submit one evaluation per project.</p>
        </div>
        <Button size="sm" variant="outline" onClick={loadAssignedSubmissions} disabled={loading}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Projects" value={loading ? '...' : submissions.length} subtitle="Across assigned hackathons" icon={Scale} color="indigo" />
        <StatCard title="Evaluated" value={loading ? '...' : evaluated.length} subtitle={submissions.length ? `${Math.round((evaluated.length / submissions.length) * 100)}% complete` : 'No projects assigned'} icon={CheckCircle2} color="emerald" />
        <StatCard title="Pending Grading" value={loading ? '...' : pending.length} subtitle="Awaiting your review" icon={Clock} color="amber" />
        <StatCard title="Average Rating Given" value={loading || averageRating === '—' ? averageRating : `${averageRating} / ${maximumScore}`} subtitle="Your completed reviews" icon={Star} color="purple" />
      </div>

      <Card header={<span className="font-semibold text-xs text-slate-800">Assigned Project Queue</span>}>
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading your assigned projects...</div>
        ) : submissions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">No projects have been assigned to you yet.</div>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => {
              const reviewed = Boolean(submission.myEvaluation);
              return (
                <div key={submission._id} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${reviewed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {reviewed ? `Reviewed: ${submission.myEvaluation.score}/${maximumScore}` : 'Pending Review'}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 truncate">{submission.title}</h3>
                    </div>
                    <p className="text-[11px] text-slate-500">{submission.hackathon?.title || 'Hackathon'} • Team: {submission.team?.name || submission.submittedBy?.name || 'Individual'}</p>
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
