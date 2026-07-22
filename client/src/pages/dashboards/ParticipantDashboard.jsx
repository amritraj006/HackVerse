import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { Trophy, Clock, FolderGit2, Users, ArrowRight, Calendar, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ParticipantDashboard = ({ user }) => {
  return (
    <div className="space-y-5">
      {/* Header Greeting */}
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
          <Link to="/hackathons">
            <Button size="sm" variant="primary">
              Browse Hackathons <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Joined Hackathons"
          value="3"
          subtitle="2 active, 1 completed"
          icon={Trophy}
          color="indigo"
        />
        <StatCard
          title="Active Projects"
          value="2"
          subtitle="1 draft, 1 submitted"
          icon={FolderGit2}
          color="emerald"
        />
        <StatCard
          title="Team Status"
          value="Neural Ninjas"
          subtitle="3/4 Teammates"
          icon={Users}
          color="amber"
        />
        <StatCard
          title="Next Deadline"
          value="4 Days"
          subtitle="AI Global Challenge 2026"
          icon={Clock}
          color="blue"
        />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Column: Active Registered Hackathons */}
        <div className="md:col-span-2 space-y-4">
          <Card header={<span className="font-semibold text-xs text-slate-800">My Active Hackathons</span>}>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                      Ongoing
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">AI Global Challenge 2026</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> Ends Aug 15
                    </span>
                    <span>•</span>
                    <span>Team: Neural Ninjas</span>
                  </p>
                </div>
                <Link to="/hackathons/h1">
                  <Button size="sm" variant="outline">
                    View & Submit
                  </Button>
                </Link>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                      Upcoming
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">Web3 & Decentralized Hack</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> Starts Sep 01
                    </span>
                    <span>•</span>
                    <span>Team: Solo</span>
                  </p>
                </div>
                <Link to="/hackathons/h2">
                  <Button size="sm" variant="outline">
                    Find Teammates
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Recommended Teammates & Notifications */}
        <div className="space-y-4">
          <Card header={<span className="font-semibold text-xs text-slate-800">Submission Milestones</span>}>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-emerald-700 bg-emerald-50/50 p-2 rounded border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <p className="font-semibold">Team Registration Complete</p>
                  <p className="text-[11px] text-slate-500">Neural Ninjas created</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2 rounded border border-slate-200/60">
                <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                <div>
                  <p className="font-semibold">GitHub Repo Submission</p>
                  <p className="text-[11px] text-slate-500">Pending final commit URL</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
