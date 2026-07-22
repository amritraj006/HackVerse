import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import { HackathonForm } from '../../components/HackathonForm';
import { hackathonService } from '../../services/hackathonService';
import { formatDate } from '../../utils/helpers';
import { Trophy, Users, FolderGit2, Plus, Settings, Calendar, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const OrganizerDashboard = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: 'info', message: '' });

  // Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const loadMyEvents = useCallback(async () => {
    try {
      const res = await hackathonService.getMyEvents();
      if (res && res.data) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: err.message || 'Failed to load your events.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    hackathonService.getMyEvents()
      .then((res) => {
        if (isMounted && res && res.data) {
          setEvents(res.data);
        }
      })
      .catch((err) => {
        if (isMounted) setAlert({ type: 'error', message: err.message || 'Failed to load events' });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const handleCreateSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await hackathonService.create(formData);
      if (res && res.data) {
        setIsCreateModalOpen(false);
        setAlert({ type: 'success', message: 'Hackathon event created successfully!' });
        loadMyEvents();
        navigate(`/hackathons/${res.data._id}/manage`);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to create hackathon.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeEventsCount = events.filter((e) => e.status === 'ongoing' || e.status === 'upcoming').length;

  return (
    <div className="space-y-5">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900">
            Organizer Console — {user?.name || 'Organizer'} 🚀
          </h1>
          <p className="text-xs text-slate-500">
            Manage your hosted hackathons, monitor participant registrations, assign judges, and publish results.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadMyEvents}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button size="sm" variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> Host New Hackathon
          </Button>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Hosted Hackathons"
          value={loading ? '...' : events.length}
          subtitle={`${activeEventsCount} active/upcoming`}
          icon={Trophy}
          color="indigo"
        />
        <StatCard
          title="Managed Judges"
          value={loading ? '...' : events.reduce((acc, curr) => acc + (curr.assignedJudges?.length || 0), 0)}
          subtitle="Assigned across events"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Status Overview"
          value={loading ? '...' : `${activeEventsCount} Active`}
          subtitle="In-progress competitions"
          icon={FolderGit2}
          color="amber"
        />
        <StatCard
          title="Account Status"
          value="Organizer"
          subtitle="Full Event Control"
          icon={Trophy}
          color="purple"
        />
      </div>

      {/* Managed Events Grid */}
      <Card header={<span className="font-semibold text-xs text-slate-800">My Managed Events</span>}>
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Loading your hosted events...
          </div>
        ) : events.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-slate-500">You have not hosted any hackathons yet.</p>
            <Button size="sm" variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-3.5 h-3.5" /> Host Your First Hackathon
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((item) => (
              <div
                key={item._id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full border ${
                        item.status === 'ongoing'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {item.status}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> Deadline: {formatDate(item.registrationDeadline)}
                    </span>
                    <span>•</span>
                    <span>Judges: {(item.assignedJudges || []).length}</span>
                    <span>•</span>
                    <span>Prize: {item.prizePool}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/hackathons/${item._id}/manage`}>
                    <Button size="sm" variant="primary">
                      <Settings className="w-3.5 h-3.5" /> Manage Workspace
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Hackathon Modal */}
      <HackathonForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
