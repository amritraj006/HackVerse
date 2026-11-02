import { Outlet, Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b12] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Cyber Glowing Nebulas */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(99,102,241,0.15)_1px,transparent_1px)] bg-[size:32px_32px] opacity-60" />
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-purple-600/5 blur-3xl pointer-events-none" />

      <div className="mb-6 relative z-10">
        <Logo to="/" size="xl" />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 animate-fade-in relative z-10 backdrop-blur-xl">
        <Outlet />
      </div>

      <div className="mt-6 text-center text-xs text-slate-400 relative z-10 font-mono">
        <Link to="/" className="hover:text-indigo-400 transition-colors">
          ← Back to Mission Control
        </Link>
      </div>
    </div>
  );
};
