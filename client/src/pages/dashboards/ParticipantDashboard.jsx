import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import { ConfirmModal } from '../../components/ConfirmModal';
import { hackathonService } from '../../services/hackathonService';
import { registrationService } from '../../services/registrationService';
import { formatDate } from '../../utils/helpers';
import {
  Trophy,
  Clock,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ParticipantDashboard = ({ user }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: 'info', message: '' });

  // For recommended hackathons
  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  // Cancel modal state
  const [cancelModal, setCancelModal] = useState({ open: false, hackathonId: null, title: '' });
  const [isCancelling, setIsCancelling] = useState(false);
  const [registeringId, setRegisteringId] = useState(null);

  const loadRegistrations = useCallback(() => {
    let isMounted = true;
    registrationService.getMyRegistrations({ status: 'active', limit: 20 })
      .then((res) => {
        if (isMounted && res?.data?.registrations) setRegistrations(res.data.registrations);
      })
      .catch((err) => {
        if (isMounted) setAlert({ type: 'error', message: err.message || 'Failed to load registrations.' });
      })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => loadRegistrations(), [loadRegistrations]);

  // Separate effect for recommended hackathons — avoids calling setState-wrapped fn inside effect
  useEffect(() => {
    let isMounted = true;
    hackathonService.getAll({ status: 'upcoming', limit: 3 })
      .then((res) => {
        if (!isMounted) return;
        if (res?.data?.hackathons) setRecommended(res.data.hackathons);
        else if (Array.isArray(res?.data)) setRecommended(res.data.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setRecLoading(false); });
    return () => { isMounted = false; };
  }, []);


  // Plain function to refresh recommended list (called from event handlers only, not effects)
  const loadRecommended = () => {
    hackathonService.getAll({ status: 'upcoming', limit: 3 })
      .then((res) => {
        if (res?.data?.hackathons) setRecommended(res.data.hackathons);
        else if (Array.isArray(res?.data)) setRecommended(res.data.slice(0, 3));
      })
      .catch(() => {});
  };

  const handleRegister = async (hackathonId) => {
    setRegisteringId(hackathonId);
    try {
      await registrationService.register(hackathonId);
      setAlert({ type: 'success', message: 'Successfully registered! 🎉' });
      loadRegistrations();
      loadRecommended();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to register.' });
    } finally {
      setRegisteringId(null);
    }
  };

  const handleCancelOpen = (hackathon) => {
    setCancelModal({ open: true, hackathonId: hackathon._id || hackathon, title: hackathon.title || 'this hackathon' });
  };

  const handleCancelConfirm = async () => {
    setIsCancelling(true);
    try {
      await registrationService.cancel(cancelModal.hackathonId);
      setAlert({ type: 'success', message: 'Registration cancelled.' });
      setCancelModal({ open: false, hackathonId: null, title: '' });
      loadRegistrations();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to cancel.' });
    } finally {
      setIsCancelling(false);
    }
  };

  // Compute metrics
  const activeRegs = registrations.filter((r) => r.status === 'active');
  const ongoingRegs = activeRegs.filter((r) => r.hackathon?.status === 'ongoing');
  const upcomingRegs = activeRegs.filter((r) => r.hackathon?.status === 'upcoming');

  // Find next deadline
  const nextDeadline = activeRegs
    .filter((r) => r.hackathon?.endDate)
    .sort((a, b) => new Date(a.hackathon.endDate) - new Date(b.hackathon.endDate))[0];

  const registeredHackathonIds = new Set(activeRegs.map((r) => r.hackathon?._id || r.hackathon));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900">
            Welcome back, {user?.name || 'Participant'}! 👋
          </h1>
          <p className="text-xs text-slate-500">
            Track your registered hackathons, project submissions, and team invitations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadRegistrations}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Link to="/hackathons">
            <Button size="sm" variant="primary">
              Browse Hackathons <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Joined Hackathons"
          value={loading ? '...' : activeRegs.length}
          subtitle={`${ongoingRegs.length} ongoing, ${upcomingRegs.length} upcoming`}
          icon={Trophy}
          color="indigo"
        />
        <StatCard
          title="Ongoing Events"
          value={loading ? '...' : ongoingRegs.length}
          subtitle="Currently in progress"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Upcoming Events"
          value={loading ? '...' : upcomingRegs.length}
          subtitle="Registered & awaiting"
          icon={Calendar}
          color="amber"
        />
        <StatCard
          title="Next Deadline"
          value={loading ? '...' : nextDeadline ? formatDate(nextDeadline.hackathon?.endDate) : 'N/A'}
          subtitle={nextDeadline?.hackathon?.title || 'No upcoming deadlines'}
          icon={Clock}
          color="blue"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Registrations */}
        <div className="md:col-span-2 space-y-4">
          <Card header={
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-800">My Active Registrations</span>
              <Link to="/hackathons" className="text-[11px] text-indigo-600 font-semibold hover:underline">
                Browse More →
              </Link>
            </div>
          }>
            {loading ? (
              <div className="py-6 text-center text-xs text-slate-500">
                Loading your registrations...
              </div>
            ) : activeRegs.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs text-slate-500">You haven't registered for any hackathons yet.</p>
                <Link to="/hackathons">
                  <Button size="sm" variant="primary">
                    <Trophy className="w-3.5 h-3.5" /> Explore Hackathons
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeRegs.map((reg) => {
                  const h = reg.hackathon;
                  if (!h) return null;
                  return (
                    <div
                      key={reg._id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full border ${
                              h.status === 'ongoing'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {h.status}
                          </span>
                          <h3 className="text-xs font-bold text-slate-900">{h.title}</h3>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Ends {formatDate(h.endDate)}
                          </span>
                          <span>·</span>
                          <span>Registered: {formatDate(reg.registeredAt)}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Link to={`/hackathons/${h._id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-500 hover:bg-rose-50"
                          onClick={() => handleCancelOpen(h)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Recommended Hackathons */}
        <div className="space-y-4">
          <Card header={<span className="font-semibold text-xs text-slate-800">Recommended Upcoming</span>}>
            {recLoading ? (
              <div className="py-4 text-center text-xs text-slate-500">Loading...</div>
            ) : recommended.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No upcoming events at the moment.</p>
            ) : (
              <div className="space-y-2.5">
                {recommended.map((item) => (
                  <div key={item._id} className="p-2.5 rounded-lg border border-slate-200/80 bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                      <span className="text-xs font-bold text-indigo-600 shrink-0">{item.prizePool}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDate(item.startDate)}
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <Link to={`/hackathons/${item._id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full text-[11px]">Details</Button>
                      </Link>
                      {!registeredHackathonIds.has(item._id) && (
                        <Button
                          size="sm"
                          variant="primary"
                          className="flex-1 text-[11px]"
                          disabled={registeringId === item._id}
                          onClick={() => handleRegister(item._id)}
                        >
                          {registeringId === item._id ? 'Joining...' : 'Join'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Cancel Registration Modal */}
      <ConfirmModal
        isOpen={cancelModal.open}
        title="Cancel Registration"
        message={`Are you sure you want to cancel your registration for "${cancelModal.title}"?`}
        confirmText="Yes, Cancel"
        confirmVariant="danger"
        loading={isCancelling}
        onClose={() => setCancelModal({ open: false, hackathonId: null, title: '' })}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
};
