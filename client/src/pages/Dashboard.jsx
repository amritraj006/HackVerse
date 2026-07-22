import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Trophy, Clock, CheckCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900">User Dashboard</h1>
          <p className="text-xs text-slate-500">Overview of your registered hackathons, active teams, and submission status.</p>
        </div>
        <Link to="/hackathons">
          <Button size="sm" variant="primary">
            <Plus className="w-3.5 h-3.5" /> Explore Hackathons
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card header={<span className="font-semibold text-xs text-slate-800">My Hackathons</span>}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-indigo-600" />
              <span className="text-xs text-slate-600">Joined</span>
            </div>
            <span className="font-bold text-sm text-slate-900">3</span>
          </div>
        </Card>

        <Card header={<span className="font-semibold text-xs text-slate-800">Active Submissions</span>}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-slate-600">Pending Review</span>
            </div>
            <span className="font-bold text-sm text-slate-900">1</span>
          </div>
        </Card>

        <Card header={<span className="font-semibold text-xs text-slate-800">Completed Projects</span>}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-slate-600">Submitted</span>
            </div>
            <span className="font-bold text-sm text-slate-900">4</span>
          </div>
        </Card>
      </div>

      <Card header={<span className="font-semibold text-xs text-slate-800">Recent Activity</span>}>
        <div className="text-xs text-slate-500 py-6 text-center">
          No recent activity logged yet. Connect to backend API to view activity streams.
        </div>
      </Card>
    </div>
  );
};
