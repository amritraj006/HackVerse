import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { HackathonCard } from '../components/HackathonCard';
import {
  Trophy,
  Users,
  FolderGit2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Zap,
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
      .catch(() => { if (isMounted) setStats((s) => ({ ...s, loading: false })); });
    return () => { isMounted = false; };
  }, []);

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
    <div className="space-y-8">
      {/* Hero Banner */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ minHeight: '220px' }}
      >
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #0d1535 0%, #0f172a 40%, #130a2e 70%, #070b14 100%)',
          }}
        />

        {/* Animated orbs */}
        <div
          className="pointer-events-none absolute animate-float"
          style={{
            top: '-40px', right: '-40px',
            width: '280px', height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="pointer-events-none absolute animate-float"
          style={{
            bottom: '-20px', left: '30%',
            width: '200px', height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            filter: 'blur(30px)',
            animationDelay: '2s',
          }}
        />

        {/* Subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-8 md:p-10 max-w-2xl">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[11px] font-semibold"
            style={{
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.25)',
              color: '#a5b4fc',
            }}
          >
            <Sparkles className="w-3 h-3" />
            <span>HackVerse · Global Hackathon Network</span>
          </div>

          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight mb-3 leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Build.{' '}
            <span className="gradient-text">Compete.</span>
            {' '}Win.
          </h1>

          <p
            className="text-sm leading-relaxed mb-6 max-w-lg"
            style={{ color: 'var(--text-muted)' }}
          >
            Join the HackVerse community — discover active hackathons, form teams, submit
            your best work, and compete against innovators worldwide.
          </p>

          <div className="flex items-center gap-3">
            <Link to="/hackathons">
              <Button size="lg" variant="primary" className="font-semibold">
                Explore Hackathons <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button
                size="lg"
                variant="ghost"
                style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-normal)' }}
              >
                My Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Ongoing */}
        <div
          className="flex items-center gap-4 p-4 rounded-xl hover-lift transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, rgba(17,24,39,0.9), rgba(13,18,32,0.95))',
            border: '1px solid var(--border-normal)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 0 16px rgba(16,185,129,0.3)',
            }}
          >
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Live Hackathons
            </p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stats.loading
                ? <span className="animate-pulse-slow" style={{ color: 'var(--text-muted)' }}>—</span>
                : statFmt(stats.ongoingCount)}
            </p>
          </div>
        </div>

        {/* Upcoming */}
        <div
          className="flex items-center gap-4 p-4 rounded-xl hover-lift transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, rgba(17,24,39,0.9), rgba(13,18,32,0.95))',
            border: '1px solid var(--border-normal)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 16px rgba(99,102,241,0.3)',
            }}
          >
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Upcoming Events
            </p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stats.loading
                ? <span className="animate-pulse-slow" style={{ color: 'var(--text-muted)' }}>—</span>
                : statFmt(stats.upcomingCount)}
            </p>
          </div>
        </div>

        {/* Total */}
        <div
          className="flex items-center gap-4 p-4 rounded-xl hover-lift transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, rgba(17,24,39,0.9), rgba(13,18,32,0.95))',
            border: '1px solid var(--border-normal)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              boxShadow: '0 0 16px rgba(245,158,11,0.3)',
            }}
          >
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Total Events
            </p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stats.loading
                ? <span className="animate-pulse-slow" style={{ color: 'var(--text-muted)' }}>—</span>
                : (stats.ongoingCount ?? 0) + (stats.upcomingCount ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Featured Hackathons */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 12px rgba(99,102,241,0.3)' }}
            >
              <Users className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Featured Events
            </h2>
          </div>
          <Link
            to="/hackathons"
            className="text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-150"
            style={{
              color: '#818cf8',
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {featuredLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-52 rounded-xl animate-shimmer"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}
              />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div
            className="py-12 text-center rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed var(--border-normal)',
              color: 'var(--text-muted)',
            }}
          >
            <Trophy className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No hackathons yet. Check back soon!</p>
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
