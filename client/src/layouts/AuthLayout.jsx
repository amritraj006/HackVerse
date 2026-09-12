import { Outlet, Link } from 'react-router-dom';
import { Code2 } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="mb-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
          <Code2 className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg text-slate-900 tracking-tight">
          HackVerse
        </span>
      </div>
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-xl shadow-xs p-6 animate-fade-in">
        <Outlet />
      </div>
      <div className="mt-6 text-center text-xs text-slate-400">
        <Link to="/" className="hover:text-indigo-600 transition-colors">
          ← Back to Homepage
        </Link>
      </div>
    </div>
  );
};
