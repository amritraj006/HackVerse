import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Trophy, Users, FolderGit2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="space-y-6">
      {/* Banner / Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 md:p-8 text-white overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-indigo-200 text-[11px] font-medium backdrop-blur-xs border border-white/10">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Hackathon Management Platform Baseline</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-snug">
            Empowering Innovation & Seamless Hackathon Organization
          </h1>
          <p className="text-xs text-indigo-100/80 leading-relaxed">
            Welcome to HackVerse! Connect, build, submit projects, and compete in global hackathons with clean workflows and real-time collaboration.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <Link to="/hackathons">
              <Button size="sm" className="bg-white text-indigo-900 hover:bg-slate-100 font-semibold border-0">
                Explore Hackathons <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Active Hackathons</p>
            <p className="text-lg font-bold text-slate-900">12 Ongoing</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Total Participants</p>
            <p className="text-lg font-bold text-slate-900">2,450 Users</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Projects Submitted</p>
            <p className="text-lg font-bold text-slate-900">580 Projects</p>
          </div>
        </Card>
      </div>

      {/* System Status / Architecture Info */}
      <Card header={<span className="font-semibold text-xs text-slate-800">MERN Architecture Boilerplate Ready</span>}>
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            This workspace is configured following the standard Model-View-Controller (MVC) architectural pattern:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">Express & Mongoose backend</span>
                <p className="text-slate-500 text-[11px]">Routes, Controllers, Services, Models, Validations, and Uploads directory.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">React + Vite + Tailwind CSS UI</span>
                <p className="text-slate-500 text-[11px]">Navbar, Sidebar, Footer, Pages, Context, Services, and Axios integration.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
