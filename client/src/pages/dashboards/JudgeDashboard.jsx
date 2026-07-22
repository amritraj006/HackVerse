import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { Scale, CheckCircle2, Clock, Star, ExternalLink, ArrowRight } from 'lucide-react';

export const JudgeDashboard = ({ user }) => {
  return (
    <div className="space-y-5">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900">
            Judge Evaluation Portal — {user?.name || 'Judge'} ⚖️
          </h1>
          <p className="text-xs text-slate-500">
            Review assigned hackathon project submissions, score rubrics, and leave constructive feedback.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Projects"
          value="12"
          subtitle="AI Global Challenge 2026"
          icon={Scale}
          color="indigo"
        />
        <StatCard
          title="Evaluated"
          value="8"
          subtitle="66% Progress"
          icon={CheckCircle2}
          trend={{ value: '66%', label: 'completion rate', positive: true }}
          color="emerald"
        />
        <StatCard
          title="Pending Grading"
          value="4"
          subtitle="Due in 48 hours"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Average Rating Given"
          value="8.4 / 10"
          subtitle="Based on criteria"
          icon={Star}
          color="purple"
        />
      </div>

      {/* Grading Queue */}
      <Card header={<span className="font-semibold text-xs text-slate-800">Pending Evaluation Queue</span>}>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                  Pending Review
                </span>
                <h3 className="text-xs font-bold text-slate-900">SmartDoc Synthesizer</h3>
              </div>
              <p className="text-[11px] text-slate-500">
                Team: Neural Ninjas • Category: Multi-Agent Workflows
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <ExternalLink className="w-3.5 h-3.5" /> View Demo
              </Button>
              <Button size="sm" variant="primary">
                Score Project <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                  Pending Review
                </span>
                <h3 className="text-xs font-bold text-slate-900">AutoCode Refactor Bot</h3>
              </div>
              <p className="text-[11px] text-slate-500">
                Team: ByteCraft • Category: Developer Tooling
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <ExternalLink className="w-3.5 h-3.5" /> View Demo
              </Button>
              <Button size="sm" variant="primary">
                Score Project <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
