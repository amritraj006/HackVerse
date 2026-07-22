import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { ConfirmModal } from '../components/ConfirmModal';
import { hackathonService } from '../services/hackathonService';
import { registrationService } from '../services/registrationService';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/helpers';
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Users,
  Lock,
  Unlock,
  CheckCircle2,
  Tag,
  Sparkles,
  Award,
} from 'lucide-react';

const STATUS_BADGE = {
  upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
  ongoing: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ended: 'bg-slate-100 text-slate-600 border-slate-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const HackathonDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: 'info', message: '' });

  // Registration state
  const [isRegistered, setIsRegistered] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Load hackathon data
  useEffect(() => {
    let isMounted = true;
    hackathonService.getById(id)
      .then((res) => {
        if (isMounted && res?.data) setHackathon(res.data);
      })
      .catch((err) => {
        if (isMounted) setAlert({ type: 'error', message: err.message || 'Failed to load hackathon.' });
      })
      .finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [id]);

  // Check registration status for logged-in user
  useEffect(() => {
    if (!user || !id) return;
    let isMounted = true;
    registrationService.getStatus(id)
      .then((res) => {
        if (isMounted && res?.data) setIsRegistered(res.data.isRegistered);
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      setAlert({ type: 'error', message: 'Please log in to register for this hackathon.' });
      return;
    }
    setRegLoading(true);
    try {
      await registrationService.register(id);
      setIsRegistered(true);
      setAlert({ type: 'success', message: 'You have successfully registered! 🎉 Good luck!' });
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to register.' });
    } finally {
      setRegLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    setIsCancelling(true);
    try {
      await registrationService.cancel(id);
      setIsRegistered(false);
      setIsCancelModalOpen(false);
      setAlert({ type: 'success', message: 'Registration cancelled successfully.' });
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to cancel registration.' });
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs text-slate-500 gap-2">
        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading hackathon details...</span>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-xs text-slate-500">Hackathon not found.</p>
        <Link to="/hackathons">
          <Button size="sm" variant="outline">← Back to Hackathons</Button>
        </Link>
      </div>
    );
  }

  const statusBadge = STATUS_BADGE[hackathon.status] || STATUS_BADGE.draft;
  const canRegister =
    hackathon.isRegistrationOpen &&
    (hackathon.status === 'upcoming' || hackathon.status === 'ongoing');

  return (
    <div className="space-y-5">
      <Link to="/hackathons" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Hackathons
      </Link>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full border ${statusBadge}`}>
              {hackathon.status}
            </span>
            {hackathon.isRegistrationOpen ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                <Unlock className="w-3 h-3" /> Registrations Open
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-2 py-0.5">
                <Lock className="w-3 h-3" /> Registrations Closed
              </span>
            )}
          </div>

          {hackathon.isResultsPublished && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              <Award className="w-3 h-3" /> Results Published
            </span>
          )}
        </div>

        <div>
          <h1 className="text-lg font-bold text-slate-900">{hackathon.title}</h1>
          {hackathon.tagline && (
            <p className="text-xs text-slate-500 mt-1">{hackathon.tagline}</p>
          )}
        </div>

        {/* Key Metrics Row */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-600">
            <Trophy className="w-4 h-4" /> {hackathon.prizePool || 'N/A'}
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            Reg. Deadline: {formatDate(hackathon.registrationDeadline)}
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            {formatDate(hackathon.startDate)} → {formatDate(hackathon.endDate)}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            Max {hackathon.maxTeamSize} per team
          </div>
        </div>

        {/* Tags */}
        {hackathon.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {hackathon.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded border border-slate-200">
                <Tag className="w-2.5 h-2.5" /> {tag}
              </span>
            ))}
          </div>
        )}

        {/* Registration CTA */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          {isRegistered ? (
            <>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" /> You are registered for this hackathon
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50"
                onClick={() => setIsCancelModalOpen(true)}
              >
                Cancel Registration
              </Button>
            </>
          ) : canRegister ? (
            <Button size="sm" variant="primary" onClick={handleRegister} disabled={regLoading}>
              {regLoading ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Registering...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Register Now — It's Free
                </span>
              )}
            </Button>
          ) : (
            <p className="text-xs text-slate-400 font-medium">Registrations are not currently open for this hackathon.</p>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: About & Rules */}
        <div className="md:col-span-2 space-y-4">
          <Card header={<span className="font-semibold text-xs text-slate-800">About & Rules</span>}>
            <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {hackathon.description || 'No description available.'}
            </div>
          </Card>

          {/* Results (if published) */}
          {hackathon.isResultsPublished && hackathon.winners?.length > 0 && (
            <Card header={<span className="font-semibold text-xs text-slate-800">🏆 Competition Results</span>}>
              <div className="space-y-2 text-xs">
                {hackathon.winners.map((w) => (
                  <div key={w.rank} className={`p-2.5 rounded-lg border flex items-center justify-between ${
                    w.rank === 1 ? 'bg-amber-50 border-amber-200' :
                    w.rank === 2 ? 'bg-slate-50 border-slate-200' :
                    'bg-orange-50 border-orange-200'
                  }`}>
                    <div>
                      <span className="font-bold">
                        {w.rank === 1 ? '🥇' : w.rank === 2 ? '🥈' : '🥉'} {w.prize}
                      </span>
                      {w.submission && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {w.submission.title || 'Project submission'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          {/* Key Dates */}
          <Card header={<span className="font-semibold text-xs text-slate-800">Key Dates</span>}>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Reg. Deadline</span>
                <span className="font-semibold text-slate-800">{formatDate(hackathon.registrationDeadline)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Start Date</span>
                <span className="font-semibold text-slate-800">{formatDate(hackathon.startDate)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">End Date</span>
                <span className="font-semibold text-slate-800">{formatDate(hackathon.endDate)}</span>
              </div>
            </div>
          </Card>

          {/* Organizer */}
          {hackathon.organizer && (
            <Card header={<span className="font-semibold text-xs text-slate-800">Organized By</span>}>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                  {hackathon.organizer.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{hackathon.organizer.name}</p>
                  <p className="text-slate-500">{hackathon.organizer.email}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Assigned Judges */}
          {hackathon.assignedJudges?.length > 0 && (
            <Card header={<span className="font-semibold text-xs text-slate-800">Judges ({hackathon.assignedJudges.length})</span>}>
              <div className="space-y-2">
                {hackathon.assignedJudges.map((judge) => (
                  <div key={judge._id} className="flex items-center gap-2 text-xs">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {judge.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{judge.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Cancel Registration Confirmation */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        title="Cancel Registration"
        message={`Are you sure you want to cancel your registration for "${hackathon.title}"? You can re-register later if registrations are still open.`}
        confirmText="Cancel Registration"
        confirmVariant="danger"
        loading={isCancelling}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
};
