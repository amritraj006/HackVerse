import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { Trophy, Users, FolderGit2, Plus, Settings, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OrganizerDashboard = ({ user }) => {
  return (
    <div className="space-y-5">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900">
            Organizer Console — {user?.name || 'Organizer'} 🚀
          </h1>
          <p className="text-xs text-slate-500">
            Manage your hosted hackathons, monitor participant registrations, and review submissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/hackathons/new">
            <Button size="sm" variant="primary">
              <Plus className="w-3.5 h-3.5" /> Host New Hackathon
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Hosted Hackathons"
          value="4"
          subtitle="2 active, 2 completed"
          icon={Trophy}
          color="indigo"
        />
        <StatCard
          title="Total Hackers"
          value="892"
          subtitle="+14% this week"
          icon={Users}
          trend={{ value: '14%', label: 'vs last week', positive: true }}
          color="emerald"
        />
        <StatCard
          title="Projects Received"
          value="145"
          subtitle="48 awaiting review"
          icon={FolderGit2}
          color="amber"
        />
        <StatCard
          title="Total Prize Pool"
          value="$50,000"
          subtitle="Across all events"
          icon={Trophy}
          color="purple"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hosted Events List */}
        <div className="md:col-span-2 space-y-4">
          <Card header={<span className="font-semibold text-xs text-slate-800">My Managed Events</span>}>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                      Live Now
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">AI Global Challenge 2026</h3>
                  </div>
                  <p className="text-[11px] text-slate-500">412 Participants • 64 Submissions • Ends Aug 15</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="outline">
                    <Settings className="w-3 h-3" /> Manage
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                      Draft
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">CyberSecurity Hackfest '26</h3>
                  </div>
                  <p className="text-[11px] text-slate-500">Draft Setup • Target Launch Sep 10</p>
                </div>
                <Button size="sm" variant="secondary">
                  Publish Event
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Feed */}
        <div className="space-y-4">
          <Card header={<span className="font-semibold text-xs text-slate-800">Organizer Tasks</span>}>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 space-y-0.5">
                <p className="font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Assign Judges
                </p>
                <p className="text-[11px] text-amber-800">3 judges required for AI Challenge evaluation.</p>
              </div>

              <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-0.5">
                <p className="font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sponsorship Cleared
                </p>
                <p className="text-[11px] text-emerald-800">$25,000 prize escrow verified.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
