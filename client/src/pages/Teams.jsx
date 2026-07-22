import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Users, UserPlus } from 'lucide-react';

export const Teams = () => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900">Teams & Teammate Matchmaker</h1>
          <p className="text-xs text-slate-500">Find teammates with complementary skills or manage your hackathon team.</p>
        </div>
        <Button size="sm" variant="primary">
          <UserPlus className="w-3.5 h-3.5" /> Create Team
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-bold text-slate-900">Neural Ninjas</h2>
            </div>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
              3/4 Members
            </span>
          </div>
          <p className="text-xs text-slate-500">Looking for 1 Frontend Developer skilled in React & Tailwind CSS.</p>
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
            <span className="text-slate-400 text-[11px]">Leader: @amritraj</span>
            <Button size="sm" variant="secondary">
              Request to Join
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
