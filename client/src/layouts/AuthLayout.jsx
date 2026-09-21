import { Outlet, Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-violet-100/50 blur-3xl pointer-events-none" />
      <div className="mb-7 relative">
        <Logo to="/" size="xl" />
      </div>
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-in relative">
        <Outlet />
      </div>
      <div className="mt-6 text-center text-xs text-slate-400 relative">
        <Link to="/" className="hover:text-indigo-600 transition-colors">
          ← Back to Homepage
        </Link>
      </div>
    </div>
  );
};
