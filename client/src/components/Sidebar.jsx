import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { X, Activity } from 'lucide-react';
import { ALL_NAV_ITEMS, SECONDARY_NAV_ITEMS } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';
import { Logo } from './Logo';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const userRole = user?.role || 'participant';

  // Filter items matching active role
  const navItems = ALL_NAV_ITEMS.filter((item) =>
    item.roles.includes(userRole)
  );

  // Close on Escape key press when open on mobile
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar navigation drawer */}
      <aside
        className={`fixed md:sticky top-0 md:top-14 left-0 z-50 md:z-20 h-screen md:h-[calc(100vh-3.5rem)] w-64 md:w-56 md:shrink-0 bg-white dark:bg-slate-950/95 border-r border-slate-200/80 dark:border-white/10 flex flex-col justify-between p-3.5 backdrop-blur-xl transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Scrollable navigation area */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-5 pr-1 -mr-1">
          {/* Mobile header with Logo */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 md:hidden">
            <div onClick={onClose}>
              <Logo to="/" size="sm" />
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section: Main Menu */}
          <div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-indigo-600/15 text-indigo-400 font-semibold border-l-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Section: System & Support */}
          {SECONDARY_NAV_ITEMS.length > 0 && (
            <div>
              <p className="px-2.5 pb-2 text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span>//</span> System
              </p>
              <nav className="space-y-1">
                {SECONDARY_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose && onClose()}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                          isActive
                            ? 'bg-indigo-600/15 text-indigo-400 font-semibold border-l-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Sidebar Footer info with active Role badge */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/10 px-1 shrink-0 mt-2">
          <div className="bg-slate-50 dark:bg-slate-900/90 rounded-xl p-2.5 border border-slate-200/80 dark:border-white/10 flex items-center gap-2.5 shadow-xs">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-slate-900 dark:text-slate-200 truncate">
                {isAuthenticated ? user?.name || 'Developer' : 'Guest Node'}
              </p>
              <p className="text-[10px] font-mono font-semibold uppercase text-indigo-500 dark:text-indigo-400 truncate tracking-wide">
                Role: {userRole}
              </p>
            </div>
            <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
};
