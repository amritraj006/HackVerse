import { Outlet, Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="mb-6">
        <Logo to="/" size="xl" />
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
