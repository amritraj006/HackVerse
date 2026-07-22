import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Calendar, Users, Trophy, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_HACKATHONS = [
  {
    id: 'h1',
    title: 'AI Global Challenge 2026',
    tagline: 'Build next-gen autonomous LLM agents and multi-agent workflows',
    prizePool: '$25,000',
    participants: 412,
    status: 'ongoing',
    statusBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    deadline: 'Aug 15, 2026',
  },
  {
    id: 'h2',
    title: 'Web3 & Decentralized Hack',
    tagline: 'Create decentralized finance & zero-knowledge security protocols',
    prizePool: '$15,000',
    participants: 280,
    status: 'upcoming',
    statusBadge: 'bg-blue-50 text-blue-700 border-blue-200',
    deadline: 'Sep 01, 2026',
  },
  {
    id: 'h3',
    title: 'Open Source Dev Sprint',
    tagline: 'Contribute to core developer tooling & UI design systems',
    prizePool: '$10,000',
    participants: 195,
    status: 'upcoming',
    statusBadge: 'bg-blue-50 text-blue-700 border-blue-200',
    deadline: 'Sep 20, 2026',
  },
];

export const Hackathons = () => {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900">Explore Hackathons</h1>
          <p className="text-xs text-slate-500">Discover active, upcoming, and past hackathons worldwide.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Filter className="w-3.5 h-3.5" /> Filter
          </Button>
        </div>
      </div>

      {/* Hackathons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_HACKATHONS.map((item) => (
          <Card key={item.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full border ${item.statusBadge}`}>
                  {item.status}
                </span>
                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> {item.prizePool}
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h2>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.tagline}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> {item.participants}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {item.deadline}
                </span>
              </div>
              <Link to={`/hackathons/${item.id}`}>
                <Button size="sm" variant="secondary">
                  View
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
