import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { ConfirmModal } from '../components/ConfirmModal';
import { DataTable } from '../components/DataTable';
import { RegisterHackathonModal } from '../components/RegisterHackathonModal';
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
  UserCheck,
  FileText,
  Crown,
  Clock,
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
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  // Registration state
  const [isRegistered, setIsRegistered] = useState(false);
  const [regStatusData, setRegStatusData] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
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

  // Published rankings are public so participants can see the final standings.
  useEffect(() => {
    if (!hackathon?.isResultsPublished) {
      return;
    }
    let isMounted = true;
    hackathonService.getLeaderboard(id)
      .then((res) => { if (isMounted) setLeaderboard(res?.data?.rankings || []); })
      .catch((err) => { if (isMounted) setAlert({ type: 'error', message: err.message || 'Failed to load the leaderboard.' }); })
      .finally(() => { if (isMounted) setLeaderboardLoading(false); });
    return () => { isMounted = false; };
  }, [hackathon?.isResultsPublished, id]);

  // Check registration status & team details for logged-in user
  const fetchRegStatus = () => {
    if (!user || !id) return;
    registrationService.getStatus(id)
      .then((res) => {
        if (res?.data) {
          setIsRegistered(res.data.isRegistered);
          setRegStatusData(res.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchRegStatus();
  }, [id, user]);

  const handleRegister = () => {
    if (!user) {
      setAlert({ type: 'error', message: 'Please log in to register for this hackathon.' });
      return;
    }
    setIsRegisterModalOpen(true);
  };

  const handleRegisterModalSuccess = (msg) => {
    setIsRegistered(true);
    fetchRegStatus();
    setAlert({ type: 'success', message: msg });
  };

  const handleCancelConfirm = async () => {
    setIsCancelling(true);
    try {
      await registrationService.cancel(id);
      setIsRegistered(false);
      setRegStatusData(null);
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
  const isParticipant = !user || user.role === 'participant';
  const canRegister =
    isParticipant &&
    hackathon.isRegistrationOpen &&
    (hackathon.status === 'upcoming' || hackathon.status === 'ongoing');
  const roleRestrictedMessage = user && user.role !== 'participant'
    ? `As a${user.role === 'organizer' ? 'n Organizer' : user.role === 'judge' ? ' Judge' : 'n Admin'}, you cannot register as a participant.`
    : null;
  // Team creator check: user is in a team and is the team leader
  const leaderId = regStatusData?.team?.leader?._id || regStatusData?.team?.leader;
  const currentUserId = user?.id || user?._id;
  const isTeamCreator = regStatusData?.team
    ? leaderId?.toString() === currentUserId?.toString()
    : false;
  // User can cancel: either solo-registered (no team) or is the team creator
  const canCancelRegistration = isRegistered && (!regStatusData?.team || isTeamCreator);

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
          {roleRestrictedMessage ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
              <Award className="w-3.5 h-3.5 shrink-0" />
              {roleRestrictedMessage}
            </div>
          ) : isRegistered ? (
            <>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                {regStatusData?.team ? 'You are registered as part of a team' : 'You are registered for this hackathon'}
              </div>
              {canCancelRegistration ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600 hover:bg-rose-50"
                  onClick={() => setIsCancelModalOpen(true)}
                >
                  {regStatusData?.team ? 'Cancel Team Registration' : 'Cancel Registration'}
                </Button>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium italic">
                  Only the team creator can cancel the team registration
                </span>
              )}
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

      {/* Participant Team / Solo Registration Details Card */}
      {user && user.role === 'participant' && isRegistered && regStatusData && (
        <Card
          header={
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                {regStatusData.team ? (
                  <>
                    <Users className="w-4 h-4 text-indigo-600" />
                    Your Team Details
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    Your Solo Registration Details
                  </>
                )}
              </span>
              {regStatusData.team ? (
                <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full flex items-center gap-1">
                  <Users className="w-3 h-3" /> Team Registration
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Solo Registration
                </span>
              )}
            </div>
          }
        >
          {regStatusData.team ? (
            /* TEAM REGISTRATION DETAILS */
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Team Name</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{regStatusData.team.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Team Creator</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    {regStatusData.team.leader?.name || 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Team Status</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider mt-1 ${
                    regStatusData.team.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : regStatusData.team.status === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {regStatusData.team.status || 'Pending'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Project Submission</span>
                  {regStatusData.submission ? (
                    <div className="mt-0.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${
                        regStatusData.submission.status === 'submitted'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {regStatusData.submission.status === 'submitted' ? 'Submitted' : 'Draft'}
                      </span>
                      {regStatusData.submission.title && (
                        <p className="text-[11px] font-medium text-slate-700 truncate max-w-[160px] mt-0.5">
                          "{regStatusData.submission.title}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-500 text-[11px] font-medium mt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Not Submitted Yet
                    </span>
                  )}
                </div>
              </div>

              {/* Team Members List */}
              <div>
                <span className="text-slate-500 font-semibold block mb-2 text-[11px] uppercase tracking-wider">
                  Team Members ({regStatusData.team.members?.length || 0})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {regStatusData.team.members?.map((member) => {
                    const isLeader =
                      (typeof member === 'object' && member._id === (regStatusData.team.leader?._id || regStatusData.team.leader)) ||
                      member === regStatusData.team.leader;

                    const name = typeof member === 'object' ? member.name : 'Member';
                    const email = typeof member === 'object' ? member.email : '';

                    return (
                      <div key={typeof member === 'object' ? member._id : member} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <p className="font-semibold text-slate-800 truncate">{name}</p>
                            {email && <p className="text-[10px] text-slate-400 truncate">{email}</p>}
                          </div>
                        </div>
                        {isLeader && (
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded shrink-0 flex items-center gap-0.5">
                            <Crown className="w-2.5 h-2.5" /> Creator
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* SOLO REGISTRATION DETAILS */
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Registration Mode</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 flex items-center gap-1">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    Solo Registration
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Participant Name</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {regStatusData.registration?.participant?.name || user.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {regStatusData.registration?.participant?.email || user.email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Registration Status</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {regStatusData.registration?.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: About & Rules */}
        <div className="md:col-span-2 space-y-4">
          <Card header={<span className="font-semibold text-xs text-slate-800">About & Rules</span>}>
            <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {hackathon.description || 'No description available.'}
            </div>
          </Card>

          {hackathon.isResultsPublished && (
            <Card header={<span className="font-semibold text-xs text-slate-800">🏆 Final Leaderboard</span>}>
              <DataTable
                columns={[
                  { header: 'Rank', accessor: (row) => <span className="font-bold text-slate-900">#{row.rank}</span> },
                  { header: 'Team Name', accessor: 'teamName' },
                  { header: 'Project Name', accessor: 'projectName' },
                  { header: 'Total Score', accessor: (row) => <span className="font-semibold text-indigo-700">{row.totalScore} / {row.maxScore}</span> },
                  { header: 'Position', accessor: (row) => row.position || '—' },
                  { header: 'Winner', accessor: (row) => row.isWinner ? <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full">🏆 Winner</span> : '—' },
                ]}
                data={leaderboard}
                loading={leaderboardLoading}
                searchPlaceholder="Search standings..."
                emptyMessage="No evaluated projects were available for the final rankings."
              />
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
        title={regStatusData?.team ? 'Cancel Team Registration' : 'Cancel Registration'}
        message={
          regStatusData?.team
            ? `Are you sure you want to cancel the team registration for "${hackathon.title}"? This will disestablish your team "${regStatusData.team.name}" and cancel all team members' registrations. They will be notified and can register individually.`
            : `Are you sure you want to cancel your registration for "${hackathon.title}"? You can re-register later if registrations are still open.`
        }
        confirmText={regStatusData?.team ? 'Cancel Team Registration' : 'Cancel Registration'}
        confirmVariant="danger"
        loading={isCancelling}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
      />

      {/* Solo vs Group Registration Modal */}
      <RegisterHackathonModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        hackathon={hackathon}
        onSuccess={handleRegisterModalSuccess}
      />
    </div>
  );
};
