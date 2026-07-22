import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { Users, Trophy, FolderGit2, ShieldCheck, Activity, UserPlus, Server } from 'lucide-react';

export const AdminDashboard = ({ user }) => {
  return (
    <div className="space-y-5">
      {/* Header Greeting */}
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
          <Button size="sm" variant="primary">
            <UserPlus className="w-3.5 h-3.5" /> Manage Users
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Platform Users"
          value="2,450"
          subtitle="Active registered users"
          icon={Users}
          trend={{ value: '18%', label: 'vs last month', positive: true }}
          color="indigo"
        />
        <StatCard
          title="Total Hackathons"
          value="18"
          subtitle="12 ongoing, 6 completed"
          icon={Trophy}
          color="emerald"
        />
        <StatCard
          title="Total Submissions"
          value="580"
          subtitle="Verified repositories"
          icon={FolderGit2}
          color="amber"
        />
        <StatCard
          title="System Health"
          value="99.9%"
          subtitle="MongoDB & API active"
          icon={Server}
          color="blue"
        />
      </div>

      {/* Role Breakdown & Logs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card header={<span className="font-semibold text-xs text-slate-800">User Role Distribution</span>}>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200/60">
              <span className="font-semibold text-slate-700">Participants</span>
              <span className="font-bold text-slate-900">2,100 (85.7%)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200/60">
              <span className="font-semibold text-slate-700">Organizers</span>
              <span className="font-bold text-slate-900">280 (11.4%)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200/60">
              <span className="font-semibold text-slate-700">Judges</span>
              <span className="font-bold text-slate-900">62 (2.5%)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200/60">
              <span className="font-semibold text-slate-700">Administrators</span>
              <span className="font-bold text-slate-900">8 (0.4%)</span>
            </div>
          </div>
        </Card>

        <div className="md:col-span-2">
          <Card header={<span className="font-semibold text-xs text-slate-800">Audit & Governance Logs</span>}>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Role updated for user @organizer_dev to Organizer</span>
                </div>
                <span className="text-[10px] text-slate-400">10 mins ago</span>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Database backup snapshot created successfully</span>
                </div>
                <span className="text-[10px] text-slate-400">1 hour ago</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
