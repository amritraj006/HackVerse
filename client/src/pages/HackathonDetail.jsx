import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, Trophy, Calendar, Users } from 'lucide-react';

export const HackathonDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-5">
      <Link to="/hackathons" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Hackathons
      </Link>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
            Ongoing Hackathon
          </span>
          <span className="text-xs font-semibold text-slate-500">ID: {id}</span>
        </div>
        <h1 className="text-lg font-bold text-slate-900">AI Global Challenge 2026</h1>
        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
          Build next-generation autonomous LLM agents, multi-agent tools, and web applications. Compete for cash prizes, mentorship, and platform recognition.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-600">
            <Trophy className="w-4 h-4" /> $25,000 Prize Pool
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" /> Deadline: Aug 15, 2026
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" /> Max Team Size: 4
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <Button size="sm" variant="primary">
            Register Now
          </Button>
          <Button size="sm" variant="outline">
            Submit Project
          </Button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <Card header={<span className="font-semibold text-xs text-slate-800">Hackathon Overview & Rules</span>}>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Participants are required to build fully functional web or mobile applications incorporating generative AI, multi-agent frameworks, or intelligent automation.
              </p>
              <h3 className="font-bold text-slate-900 text-xs">Submission Requirements:</h3>
              <ul className="space-y-1 pl-4 list-disc text-slate-600">
                <li>Public GitHub repository with setup instructions</li>
                <li>Video demonstration (max 3 minutes)</li>
                <li>Deployed live demo link</li>
              </ul>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card header={<span className="font-semibold text-xs text-slate-800">Prizes Breakdown</span>}>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-amber-50 border border-amber-200 flex justify-between">
                <span className="font-semibold text-amber-900">🥇 1st Place</span>
                <span className="font-bold text-amber-900">$12,000</span>
              </div>
              <div className="p-2 rounded bg-slate-100 border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-800">🥈 2nd Place</span>
                <span className="font-bold text-slate-800">$8,000</span>
              </div>
              <div className="p-2 rounded bg-orange-50 border border-orange-200 flex justify-between">
                <span className="font-semibold text-orange-900">🥉 3rd Place</span>
                <span className="font-bold text-orange-900">$5,000</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
