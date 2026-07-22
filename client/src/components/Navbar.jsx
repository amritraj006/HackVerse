import { Link } from 'react-router-dom';
import { Search, Bell, Menu, Code2, Plus } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../hooks/useAuth';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-2xs">
      {/* Left section: Brand logo & sidebar toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors md:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
            HackVerse
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
            Platform
          </span>
        </Link>
      </div>

      {/* Middle section: Global search bar */}
      <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search hackathons, projects, teams..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* Right section: Actions & Profile */}
      <div className="flex items-center gap-2">
        <Link to="/hackathons/new">
          <Button size="sm" variant="primary">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Host Hackathon</span>
          </Button>
        </Link>

        {/* Notifications */}
        <button
          className="relative p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Profile / Auth Button */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700 border border-slate-300">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <button
              onClick={logout}
              className="text-xs text-slate-500 hover:text-rose-600 font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 pl-2">
            <Link to="/login">
              <Button size="sm" variant="ghost">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" variant="secondary">
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
