import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, Code2, Plus, CheckCheck, Trash2, X, Sparkles, Trophy, Shield, Info } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../hooks/useAuth';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Welcome to HackVerse!',
    message: 'Explore active hackathons or register as an organizer or judge.',
    time: 'Just now',
    read: false,
    type: 'system',
  },
  {
    id: 'n2',
    title: 'Global AI Hackathon 2026',
    message: 'Registrations are now open for teams up to 4 members.',
    time: '2 hours ago',
    read: false,
    type: 'hackathon',
  },
  {
    id: 'n3',
    title: 'Judge Assignment Portal Ready',
    message: 'Organizers can now assign judges and calculate live leaderboards.',
    time: '1 day ago',
    read: true,
    type: 'judge',
  },
];

export const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('hackverse_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const popoverRef = useRef(null);
  const avatarUrl = user?.avatar;

  // Persist notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hackverse_notifications', JSON.stringify(notifications));
    } catch {
      // Ignore storage errors
    }
  }, [notifications]);

  // Click outside to close notification popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/hackathons?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleToggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'hackathon':
        return <Trophy className="w-3.5 h-3.5 text-indigo-600" />;
      case 'judge':
        return <Shield className="w-3.5 h-3.5 text-purple-600" />;
      case 'system':
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

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
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hackathons, projects, teams..."
            className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </form>
      </div>

      {/* Right section: Actions & Profile */}
      <div className="flex items-center gap-2">
        <Link to="/hackathons/new">
          <Button size="sm" variant="primary">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Host Hackathon</span>
          </Button>
        </Link>

        {/* Notifications Button & Popover */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="View notifications"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 bg-indigo-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200/90 z-50 overflow-hidden text-xs animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Bell className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="p-1 text-[11px] text-indigo-600 hover:bg-indigo-50 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3 h-3" /> Read all
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="p-1 text-[11px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      title="Clear notifications"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Notification Items List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-1">
                    <Info className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="font-medium text-slate-600">No notifications</p>
                    <p className="text-[11px]">You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleToggleRead(n.id)}
                      className={`p-3 transition-colors flex gap-2.5 cursor-pointer ${
                        n.read ? 'bg-white hover:bg-slate-50/80' : 'bg-indigo-50/40 hover:bg-indigo-50/70'
                      }`}
                    >
                      <div className="p-1.5 bg-slate-100 rounded-lg shrink-0 h-fit mt-0.5">
                        {getNotificationIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`font-semibold truncate ${n.read ? 'text-slate-800' : 'text-slate-900 font-bold'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                <Link
                  to="/hackathons"
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-semibold text-indigo-600 hover:underline"
                >
                  View All Platform Events →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile / Auth Button */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <Link
              to="/profile"
              className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              title="View Profile"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold overflow-hidden border border-slate-200">
                {avatarUrl ? (
                  <img
                    src={
                      avatarUrl.startsWith('http') || avatarUrl.startsWith('blob:')
                        ? avatarUrl
                        : `${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}${avatarUrl}`
                    }
                    alt={user?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
              <span className="hidden lg:inline text-xs font-medium text-slate-800">
                {user?.name?.split(' ')[0]}
              </span>
            </Link>
            <button
              onClick={logout}
              className="text-xs text-slate-500 hover:text-rose-600 font-medium transition-colors cursor-pointer"
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
