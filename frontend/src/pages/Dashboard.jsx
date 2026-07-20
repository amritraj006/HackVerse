import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Badge, Button, Loader, Skeleton } from '../components/common/UI';
import {
  Users,
  Trophy,
  ClipboardList,
  FileCode,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.data);
      } catch (err) {
        showToast(err.message || 'Failed to load dashboard metrics', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [showToast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28" count={4} />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // --- ADMIN VIEW ---
  if (user?.role === 'admin') {
    const roleChartData = Object.entries(stats?.users || {}).map(([key, val]) => ({
      name: key.toUpperCase(),
      users: val,
    }));

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Command Center</h1>
            <p className="text-xs text-gray-500">System performance, users directory, and hackathon approvals</p>
          </div>
          <Button onClick={() => navigate('/hackathons')} variant="secondary" className="flex items-center gap-2">
            <span>Manage All Hackathons</span>
            <ArrowRight size={14} />
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Total User base</p>
              <h3 className="text-lg font-bold text-gray-800 mt-1">
                {Object.values(stats?.users || {}).reduce((a, b) => a + b, 0)}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
              <Users size={20} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Ongoing Hackathons</p>
              <h3 className="text-lg font-bold text-gray-800 mt-1">{stats?.hackathons?.ongoing || 0}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Registered Teams</p>
              <h3 className="text-lg font-bold text-gray-800 mt-1">{stats?.totalTeams || 0}</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-full text-purple-600">
              <ClipboardList size={20} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Submissions Received</p>
              <h3 className="text-lg font-bold text-gray-800 mt-1">{stats?.totalSubmissions || 0}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-full text-amber-600">
              <FileCode size={20} />
            </div>
          </div>
        </div>

        {/* Charts & Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-subtle">
            <h3 className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-wider">User Distribution by Role</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} />
                  <Bar dataKey="users" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-wider">Hackathons Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-xs text-gray-500 font-medium">Upcoming Events</span>
                  <Badge variant="blue">{stats?.hackathons?.upcoming || 0}</Badge>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-xs text-gray-500 font-medium">Active Events (Ongoing)</span>
                  <Badge variant="emerald">{stats?.hackathons?.ongoing || 0}</Badge>
                </div>
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs text-gray-500 font-medium">Ended Events (Completed)</span>
                  <Badge variant="gray">{stats?.hackathons?.completed || 0}</Badge>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 text-center">
              <Link to="/admin/users" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                View all users directory →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Hackathons */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle">
          <h3 className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-wider">Recent System Hackathons</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Organizer</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Dates</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats?.recentHackathons?.map((h) => (
                  <tr key={h._id}>
                    <td className="px-4 py-3 font-semibold text-gray-800">{h.title}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{h.organizer?.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(h.startDate).toLocaleDateString()} - {new Date(h.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={h.status === 'ongoing' ? 'emerald' : h.status === 'upcoming' ? 'blue' : 'gray'}>
                        {h.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/hackathons/${h._id}`} className="text-xs font-bold text-primary-600 hover:underline">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- ORGANIZER VIEW ---
  if (user?.role === 'organizer') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Organizer Console</h1>
            <p className="text-xs text-gray-500">Track registrations, process project submissions, and judge panels</p>
          </div>
          <Button onClick={() => navigate('/hackathons?create=true')} className="flex items-center gap-2">
            <PlusCircle size={16} />
            <span>Host New Hackathon</span>
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">My Hackathons</p>
              <h3 className="text-lg font-bold text-gray-800 mt-1">{stats?.hackathonsCount || 0}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
              <Trophy size={20} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Teams Formed</p>
              <h3 className="text-lg font-bold text-gray-800 mt-1">{stats?.teamsCount || 0}</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-full text-purple-600">
              <Users size={20} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Registrations</p>
              <h3 className="text-lg font-bold text-gray-800 mt-1">{stats?.registrationsCount || 0}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
              <ClipboardList size={20} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Projects Submitted</p>
              <h3 className="text-lg font-bold text-gray-800 mt-1">{stats?.submissionsCount || 0}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-full text-amber-600">
              <FileCode size={20} />
            </div>
          </div>
        </div>

        {/* Owned Hackathons List */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle">
          <h3 className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-wider">My Hosted Events</h3>
          {stats?.hackathonsList?.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-gray-500">You haven't hosted any hackathons yet.</p>
              <Button onClick={() => navigate('/hackathons?create=true')} variant="secondary" size="sm" className="mt-2">
                Create your first event
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Theme</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Timeline</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats?.hackathonsList?.map((h) => (
                    <tr key={h._id}>
                      <td className="px-4 py-3 font-semibold text-gray-800">{h.title}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{h.theme}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(h.startDate).toLocaleDateString()} - {new Date(h.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={h.status === 'ongoing' ? 'emerald' : h.status === 'upcoming' ? 'blue' : 'gray'}>
                          {h.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/hackathons/${h._id}`} className="text-xs font-bold text-primary-600 hover:underline">
                          View details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- PARTICIPANT VIEW ---
  if (user?.role === 'participant') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Developer Dashboard</h1>
            <p className="text-xs text-gray-500">Track registrations, team invites, and project submission deadlines</p>
          </div>
          <Button onClick={() => navigate('/hackathons')} className="flex items-center gap-2">
            <span>Explore Hackathons</span>
            <ArrowRight size={14} />
          </Button>
        </div>

        {/* Registered Events */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle">
          <h3 className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-wider">My Registered Hackathons</h3>
          {stats?.registrations?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-gray-500 mb-4">You are not registered for any hackathons yet.</p>
              <Button onClick={() => navigate('/hackathons')} variant="primary" size="sm">
                Browse Active Events
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats?.registrations?.map(({ registration: reg, submission }) => (
                <div key={reg._id} className="border border-gray-200 rounded-lg p-5 flex flex-col justify-between hover:border-primary-300 transition-colors bg-gray-50/20">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{reg.hackathon.title}</h4>
                      <Badge variant={reg.hackathon.status === 'ongoing' ? 'emerald' : reg.hackathon.status === 'upcoming' ? 'blue' : 'gray'}>
                        {reg.hackathon.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{reg.hackathon.theme} • {reg.hackathon.mode.toUpperCase()}</p>
                    
                    {/* Team Affiliation */}
                    <div className="text-xs py-2 px-3 bg-white border border-gray-150 rounded space-y-1 mb-4">
                      {reg.team ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Team:</span>
                            <span className="font-semibold text-gray-800">{reg.team.name}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-gray-400">Invite Code:</span>
                            <code className="bg-gray-100 px-1 rounded text-primary-600 font-bold select-all">{reg.team.inviteCode}</code>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-500">No team joined yet</span>
                          <Link to="/participant/teams" className="text-primary-600 font-semibold hover:underline">
                            Form or Join Team
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                    <div>
                      {submission ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          ✓ Submitted: {submission.projectName}
                        </span>
                      ) : reg.hackathon.status === 'ongoing' ? (
                        <span className="text-amber-600 font-semibold">⚠️ Pending submission</span>
                      ) : (
                        <span className="text-gray-400">Not open</span>
                      )}
                    </div>
                    <Link to={`/hackathons/${reg.hackathon._id}`} className="text-xs font-bold text-primary-600 hover:underline">
                      Enter Lobby →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- JUDGE VIEW ---
  if (user?.role === 'judge') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Judge Portal</h1>
          <p className="text-xs text-gray-500">Evaluate submissions, enter scores across criteria, and finalize reviews</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Assigned Hackathons</p>
              <h3 className="text-lg font-bold text-gray-800 mt-1">{stats?.hackathonsCount || 0}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
              <Trophy size={20} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Pending Evaluations</p>
              <h3 className="text-lg font-bold text-rose-600 mt-1">{stats?.pendingReviewsCount || 0}</h3>
            </div>
            <div className="p-3 bg-rose-50 rounded-full text-rose-600">
              <ClipboardList size={20} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Completed Ratings</p>
              <h3 className="text-lg font-bold text-emerald-600 mt-1">{stats?.completedReviewsCount || 0}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
              <FileCode size={20} />
            </div>
          </div>
        </div>

        {/* Assigned Projects to Grade */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle">
          <h3 className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-wider">Pending Evaluation Queue</h3>
          {stats?.pendingSubmissions?.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-500">
              No pending projects left for evaluation. Well done!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Project Name</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Hackathon</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Competing Team</th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats?.pendingSubmissions?.map(({ submission }) => (
                    <tr key={submission._id}>
                      <td className="px-4 py-3 font-semibold text-gray-800">{submission.projectName}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{submission.hackathon?.title}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{submission.team?.name}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          onClick={() => navigate(`/judge/reviews?subId=${submission._id}`)}
                          size="sm"
                        >
                          Grade Project
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-10">
      <p className="text-sm text-gray-500">Role configuration error. Contact admin.</p>
    </div>
  );
};

export default Dashboard;
