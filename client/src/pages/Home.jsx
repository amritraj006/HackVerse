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
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 md:p-8 text-white overflow-hidden shadow-xs">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 w-40 h-40 rounded-full bg-purple-500/10 blur-2xl" />

        {/* Decorative hero brand emblem */}
        <div className="hidden md:flex absolute right-12 top-1/2 -translate-y-1/2 items-center justify-center pointer-events-none opacity-85">
          <div className="relative">
            <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-25 blur-2xl animate-pulse" />
            <LogoIcon size="xl" className="w-28 h-28 drop-shadow-2xl" />
          </div>
        </div>

        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-indigo-200 text-[11px] font-medium backdrop-blur-xs border border-white/10">
            <LogoIcon size="xs" />
            <span>HackVerse · Global Hackathon Network</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-snug">
            Build. Compete. Win.
          </h1>
          <p className="text-xs text-indigo-100/80 leading-relaxed">
            Join the HackVerse community — discover active hackathons, form teams, submit
            your best work, and compete against innovators worldwide.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <Link to="/hackathons">
              <Button size="sm" className="text-indigo-900 font-semibold border-0">
                Explore Hackathons <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                My Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Live Hackathons</p>
            <p className="text-lg font-bold text-slate-900">
              {stats.loading ? <span className="text-slate-300 animate-pulse">—</span> : statFmt(stats.ongoingCount)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Upcoming Events</p>
            <p className="text-lg font-bold text-slate-900">
              {stats.loading ? <span className="text-slate-300 animate-pulse">—</span> : statFmt(stats.upcomingCount)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Total Events</p>
            <p className="text-lg font-bold text-slate-900">
              {stats.loading
                ? <span className="text-slate-300 animate-pulse">—</span>
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
          <div className="py-10 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No hackathons yet. Check back soon!
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
