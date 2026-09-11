import { NavLink } from 'react-router-dom';
import { ALL_NAV_ITEMS, SECONDARY_NAV_ITEMS } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const userRole = user?.role || 'participant';

  const navItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  const roleColors = {
    admin:       { from: '#f43f5e', to: '#e11d48' },
    organizer:   { from: '#f59e0b', to: '#d97706' },
    judge:       { from: '#a855f7', to: '#7c3aed' },
    participant: { from: '#6366f1', to: '#8b5cf6' },
  };
  const roleColor = roleColors[userRole] || roleColors.participant;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`fixed md:sticky top-0 md:top-[49px] left-0 z-40 h-[calc(100vh)] md:h-[calc(100vh-49px)] w-56 flex flex-col justify-between p-3 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          background: 'rgba(7,11,20,0.95)',
          borderRight: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="space-y-5">
          {/* Main nav section */}
          <div>
            <p
              className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              Navigation
            </p>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 relative ${
                        isActive ? 'nav-active-bar' : ''
                      }`
                    }
                    style={({ isActive }) => ({
                      background: isActive
                        ? 'linear-gradient(90deg, rgba(99,102,241,0.12), rgba(139,92,246,0.06))'
                        : 'transparent',
                      color: isActive ? '#a5b4fc' : 'var(--text-muted)',
                      border: isActive ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
                    })}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.classList.contains('nav-active')) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      // will be reset by NavLink active state
                    }}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className="w-4 h-4 shrink-0"
                          style={{ color: isActive ? '#818cf8' : 'var(--text-muted)' }}
                        />
                        <span>{item.name}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Secondary nav section */}
          {SECONDARY_NAV_ITEMS.length > 0 && (
            <div>
              <p
                className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
              >
                System
              </p>
              <nav className="space-y-0.5">
                {SECONDARY_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose && onClose()}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 relative ${
                          isActive ? 'nav-active-bar' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        background: isActive ? 'linear-gradient(90deg, rgba(99,102,241,0.12), rgba(139,92,246,0.06))' : 'transparent',
                        color: isActive ? '#a5b4fc' : 'var(--text-muted)',
                        border: isActive ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
                      })}
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className="w-4 h-4 shrink-0" style={{ color: isActive ? '#818cf8' : 'var(--text-muted)' }} />
                          <span>{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Footer: user badge */}
        <div className="pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div
            className="rounded-xl p-3 flex items-center gap-2.5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}
          >
            {/* Status dot */}
            <div
              className="w-2 h-2 rounded-full shrink-0 animate-pulse-slow"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 6px rgba(16,185,129,0.5)' }}
            />
            <div className="min-w-0 flex-1">
              <p
                className="text-[11px] font-semibold truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {isAuthenticated ? user?.name || 'User' : 'Guest Mode'}
              </p>
              <p
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: `linear-gradient(90deg, ${roleColor.from}, ${roleColor.to})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {userRole}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
