import { Outlet, Link } from 'react-router-dom';
import { Code2 } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden hero-gradient">
      {/* Animated floating orbs */}
      <div
        className="pointer-events-none absolute animate-float"
        style={{
          top: '10%', left: '15%',
          width: '360px', height: '360px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animationDelay: '0s',
        }}
      />
      <div
        className="pointer-events-none absolute animate-float"
        style={{
          bottom: '15%', right: '10%',
          width: '280px', height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animationDelay: '3s',
        }}
      />
      <div
        className="pointer-events-none absolute animate-float"
        style={{
          top: '50%', right: '25%',
          width: '200px', height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192,132,252,0.08) 0%, transparent 70%)',
          filter: 'blur(30px)',
          animationDelay: '1.5s',
        }}
      />

      {/* Brand header */}
      <Link to="/" className="relative z-10 mb-8 flex flex-col items-center gap-3 group">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-200"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 0 24px rgba(99,102,241,0.4), 0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          <Code2 className="w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight gradient-text">HackVerse</span>
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Global Hackathon Platform</span>
      </Link>

      {/* Auth card */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl p-7 animate-fade-in"
        style={{
          background: 'rgba(13, 18, 32, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(148, 163, 184, 0.12)',
          boxShadow: '0 0 0 1px rgba(99,102,241,0.08), 0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Subtle top gradient line */}
        <div
          className="absolute top-0 left-8 right-8 h-px rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)' }}
        />
        <Outlet />
      </div>

      <div className="relative z-10 mt-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        <Link to="/" className="hover:text-indigo-400 transition-colors">
          ← Back to Homepage
        </Link>
      </div>
    </div>
  );
};
