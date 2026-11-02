import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Logo, LogoIcon } from '../components/Logo';
import { HackathonCard } from '../components/HackathonCard';
import {
  Trophy,
  Users,
  FolderGit2,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { hackathonService } from '../services/hackathonService';
import { registrationService } from '../services/registrationService';
import { useAuth } from '../hooks/useAuth';

export const Home = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    ongoingCount: null,
    upcomingCount: null,
    loading: true,
  });

  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [registeredIds, setRegisteredIds] = useState(new Set());

  // Fetch platform-level stats by querying hackathon counts
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      hackathonService.getAll({ status: 'ongoing', limit: 1 }),
      hackathonService.getAll({ status: 'upcoming', limit: 1 }),
    ])
      .then(([ongoingRes, upcomingRes]) => {
        if (!isMounted) return;
        setStats({
          ongoingCount: ongoingRes?.data?.pagination?.total ?? 0,
          upcomingCount: upcomingRes?.data?.pagination?.total ?? 0,
          loading: false,
        });
      })
      .catch(() => {
        if (isMounted) setStats((s) => ({ ...s, loading: false }));
      });
    return () => { isMounted = false; };
  }, []);

  // Fetch featured hackathons (mix of ongoing + upcoming)
  useEffect(() => {
    let isMounted = true;
    hackathonService.getAll({ sortBy: 'startDate', order: 'asc', limit: 6 })
      .then((res) => {
        if (!isMounted) return;
        const list = res?.data?.hackathons || res?.data || [];
        setFeatured(list.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setFeaturedLoading(false); });
    return () => { isMounted = false; };
  }, []);

  // Load user's registered hackathon IDs
  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    registrationService.getMyRegistrations({ status: 'active', limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        const regs = res?.data?.registrations || res?.data || [];
        setRegisteredIds(new Set(regs.map((r) => r.hackathon?._id || r.hackathon)));
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [user]);

  const statFmt = (val) => (val === null ? '...' : val);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950/90 to-slate-900 p-6 md:p-10 text-white overflow-hidden shadow-2xl border border-indigo-500/30 backdrop-blur-xl">
        {/* Decorative cyber grid overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(99,102,241,0.18)_1px,transparent_1px)] bg-[size:24px_24px] opacity-70" />
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl" />

        {/* Decorative hero brand emblem */}
        <div className="hidden md:flex absolute right-12 top-1/2 -translate-y-1/2 items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-30 blur-3xl animate-pulse" />
            <LogoIcon size="xl" className="w-32 h-32 drop-shadow-[0_0_35px_rgba(99,102,241,0.7)]" />
          </div>
        </div>

        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] sm:text-[11px] font-mono backdrop-blur-md border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.25)] max-w-full">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="truncate">HACKVERSE // GLOBAL INNOVATION MATRIX</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Build. Compete. <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">Win.</span>
          </h1>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-lg">
            Join the elite developer network — assemble high-velocity teams, architect breakthrough solutions, and compete for global bounties and prestige.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
            <Link to="/hackathons">
              <Button size="md" variant="primary">
                Explore Hackathons <ArrowRight className="w-4 h-4 ml-0.5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="md" variant="outline">
                Mission Control
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-3.5 hover:-translate-y-1 hover:border-emerald-500/40 transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(16,185,129,0.3)]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest">Live Hackathons</p>
            <p className="text-xl md:text-2xl font-bold font-display text-slate-900 dark:text-white">
              {stats.loading ? <span className="text-slate-400 animate-pulse">—</span> : statFmt(stats.ongoingCount)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 hover:-translate-y-1 hover:border-indigo-500/40 transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(99,102,241,0.3)]">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest">Upcoming Bounties</p>
            <p className="text-xl md:text-2xl font-bold font-display text-slate-900 dark:text-white">
              {stats.loading ? <span className="text-slate-400 animate-pulse">—</span> : statFmt(stats.upcomingCount)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 hover:-translate-y-1 hover:border-cyan-500/40 transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(6,182,212,0.3)]">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest">Total Arenas</p>
            <p className="text-xl md:text-2xl font-bold font-display text-slate-900 dark:text-white">
              {stats.loading
                ? <span className="text-slate-400 animate-pulse">—</span>
                : (stats.ongoingCount ?? 0) + (stats.upcomingCount ?? 0)}
            </p>
          </div>
        </Card>
      </div>

      {/* Featured Hackathons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" /> Featured Events
          </h2>
          <Link to="/hackathons" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {featuredLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] py-10 text-center backdrop-blur-md">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(99,102,241,0.06)_1px,transparent_1px)] bg-[size:20px_20px]" />
            <div className="relative z-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                </span>
                ARENAS // STAGING_ONLINE
              </span>
              <p className="text-sm font-semibold text-[var(--ink-heading)]">No Active Hackathons Yet</p>
              <p className="text-xs text-[var(--muted)]">Check back soon — new arenas are being configured by organizers.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((item) => (
              <HackathonCard
                key={item._id}
                hackathon={item}
                isRegistered={registeredIds.has(item._id)}
                showActions
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
