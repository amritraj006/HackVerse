import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import {
  Users, Trophy, FolderGit2, ShieldCheck, Activity, UserPlus,
  Loader2, AlertCircle, RefreshCw, UserX,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminDashboard = ({ user }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getAnalytics();
      if (res && res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const stats = analytics?.users ?? {};
  const hackathons = analytics?.hackathons ?? {};
  const submissions = analytics?.submissions ?? {};

  const pct = (count) => {
    if (!stats.total || stats.total === 0) return '0%';
    return `${((count / stats.total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900">
            System Administration — {user?.name || 'Administrator'} 🛡️
          </h1>
          <p className="text-xs text-slate-500">
            Platform-wide metrics, user role management, system health, and security governance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            title="Refresh stats"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link to="/admin">
            <Button size="sm" variant="primary">
              <UserPlus className="w-3.5 h-3.5" /> Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchAnalytics} className="ml-auto font-semibold underline cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Metrics Row */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Platform Users"
            value={stats.total?.toLocaleString() ?? '—'}
            subtitle={`${stats.blocked ?? 0} blocked account${stats.blocked !== 1 ? 's' : ''}`}
            icon={Users}
            color="indigo"
          />
          <StatCard
            title="Total Hackathons"
            value={hackathons.total?.toLocaleString() ?? '—'}
            subtitle={`${hackathons.active ?? 0} ongoing · ${hackathons.upcoming ?? 0} upcoming`}
            icon={Trophy}
            color="emerald"
          />
          <StatCard
            title="Total Submissions"
            value={submissions.total?.toLocaleString() ?? '—'}
            subtitle="Verified project submissions"
            icon={FolderGit2}
            color="amber"
          />
          <StatCard
            title="Blocked Users"
            value={stats.blocked?.toLocaleString() ?? '—'}
            subtitle="Accounts currently suspended"
            icon={UserX}
            color="rose"
          />
        </div>
      )}

      {/* Role Breakdown & Logs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card header={<span className="font-semibold text-xs text-slate-800">User Role Distribution</span>}>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              {[
                { label: 'Participants', count: stats.participants, color: 'bg-indigo-500' },
                { label: 'Organizers', count: stats.organizers, color: 'bg-emerald-500' },
                { label: 'Judges', count: stats.judges, color: 'bg-amber-500' },
                { label: 'Administrators', count: stats.admins, color: 'bg-rose-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/60 gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="font-semibold text-slate-700">{item.label}</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {item.count?.toLocaleString() ?? '—'} ({pct(item.count)})
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="md:col-span-2">
          <Card header={<span className="font-semibold text-xs text-slate-800">Platform Quick Actions</span>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { to: '/admin', label: 'Manage Users', sub: 'View, block, and update roles', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
                { to: '/admin?tab=hackathons', label: 'Manage Hackathons', sub: 'Edit or remove hackathons', icon: Trophy, color: 'text-emerald-600 bg-emerald-50' },
                { to: '/admin?tab=submissions', label: 'Manage Submissions', sub: 'Review and delete projects', icon: FolderGit2, color: 'text-amber-600 bg-amber-50' },
                { to: '/admin?tab=security', label: 'Security Audit', sub: 'Review blocked accounts', icon: ShieldCheck, color: 'text-rose-600 bg-rose-50' },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200/60 bg-slate-50 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all group"
                >
                  <div className={`p-1.5 rounded-lg ${action.color}`}>
                    <action.icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{action.label}</p>
                    <p className="text-[10px] text-slate-500">{action.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
