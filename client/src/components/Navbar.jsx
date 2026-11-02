import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Menu, Plus, CheckCheck,
  Sparkles, Trophy, Info, Check, XCircle, UserCheck, Scale,
  Sun, Moon,
} from 'lucide-react';
import { Button } from './Button';
import { Logo } from './Logo';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { notificationService } from '../services/notificationService';
import { notify } from '../utils/toast';


export const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const popoverRef = useRef(null);
  const avatarUrl = user?.avatar;

  const handleLogout = async () => {
    try {
      await logout();
      notify.info('Signed out of HackVerse.');
    } catch {
      notify.error('Logout error occurred.');
    }
  };

  // Fetch real notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setNotifLoading(true);
    try {
      const res = await notificationService.getAll();
      if (res && res.data) {
        setNotifications(res.data);
      }
    } catch {
      // Silently fail for notification fetch
    } finally {
      setNotifLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let cancelled = false;
    if (isAuthenticated) {
      const load = async () => {
        try {
          const res = await notificationService.getAll();
          if (!cancelled && res?.data) {
            setNotifications(res.data);
          }
        } catch {
          // Silently fail
        }
      };
      load();
    }
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

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

  const unreadCount = notifications.filter((n) => n.status === 'pending').length;

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: n.status === 'pending' ? 'read' : n.status })));
    } catch {
      // Ignore
    }
  };

  const handleAcceptInvite = async (notifId) => {
    setActionLoadingId(notifId);
    try {
      await notificationService.acceptInvitation(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, status: 'accepted' } : n))
      );
      notify.success('Invitation accepted successfully!');
    } catch (err) {
      notify.error(err.message || 'Failed to accept invitation');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectInvite = async (notifId) => {
    setActionLoadingId(notifId);
    try {
      await notificationService.rejectInvitation(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, status: 'rejected' } : n))
      );
      notify.info('Invitation declined.');
    } catch (err) {
      notify.error(err.message || 'Failed to reject invitation');
    } finally {
      setActionLoadingId(null);
    }
  };


  const getNotificationIcon = (type) => {
    switch (type) {
      case 'team_invite':
        return <UserCheck className="w-3.5 h-3.5 text-indigo-600" />;
      case 'judge_invite':
        return <Scale className="w-3.5 h-3.5 text-purple-600" />;
      case 'hackathon':
        return <Trophy className="w-3.5 h-3.5 text-indigo-600" />;
      case 'system':
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  const getStatusColor = (status) => {
    if (status === 'accepted') return 'text-emerald-600';
    if (status === 'rejected') return 'text-rose-600';
    return 'text-slate-500';
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 px-3 sm:px-4 flex items-center justify-between shadow-2xs">
      {/* Left section: Brand logo & sidebar toggle */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors md:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <Logo to="/" size="md" showBadge={true} badgeText="Platform" badgeClassName="hidden sm:inline-flex" />
      </div>

      {/* Right section: Actions & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Host Hackathon — only for organizers */}
        {user?.role === 'organizer' && (
          <Link to="/dashboard">
            <Button size="sm" variant="primary">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Host Hackathon</span>
            </Button>
          </Link>
        )}

        {/* Cyber Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="relative flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] text-[var(--ink)] transition-all duration-200 cursor-pointer text-xs font-mono group"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to hackathon dark mode'}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Hackathon Cyber Dark Mode'}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] transition-transform duration-300 group-hover:rotate-45" />
              <span className="hidden sm:inline text-[10px] text-amber-400 font-semibold tracking-wider">CYBER</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)] transition-transform duration-300 group-hover:-rotate-12" />
              <span className="hidden sm:inline text-[10px] text-indigo-600 font-semibold tracking-wider">LIGHT</span>
            </>
          )}
        </button>

        {/* Notifications Button & Popover */}
        {isAuthenticated && (
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => {
                setShowNotifications((prev) => !prev);
                if (!showNotifications) fetchNotifications();
              }}
              className="relative p-2 text-[var(--muted)] hover:text-[var(--ink-heading)] hover:bg-[var(--surface-hover)] border border-[var(--line)] rounded-xl transition-colors cursor-pointer"
              aria-label="View notifications"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-indigo-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center ring-2 ring-[var(--surface)] shadow-[0_0_8px_rgba(99,102,241,0.7)] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel - Responsive Viewport Positioning */}
            {showNotifications && (
              <div className="fixed inset-x-2 top-14 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-96 max-w-[calc(100vw-1rem)] bg-[var(--surface-card)] rounded-2xl shadow-2xl border border-[var(--line)] z-50 overflow-hidden text-xs backdrop-blur-xl animate-enter">
                <div className="p-3 bg-[var(--surface-subtle)] border-b border-[var(--line)] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-[var(--ink-heading)] font-display">
                    <Bell className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full">
                        {unreadCount} pending
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="px-2 py-0.5 text-[11px] font-mono text-indigo-400 hover:bg-indigo-500/10 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-3 h-3" /> Read all
                      </button>
                    )}
                  </div>
                </div>

                {/* Notification Items List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-[var(--line)]">
                  {notifLoading ? (
                    <div className="py-8 text-center text-slate-400 space-y-1">
                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-[11px]">Loading...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 space-y-1">
                      <Info className="w-6 h-6 text-slate-300 mx-auto" />
                      <p className="font-medium text-slate-600">No notifications</p>
                      <p className="text-[11px]">You're all caught up!</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const isPending = n.status === 'pending';
                      const isActing = actionLoadingId === n._id;
                      return (
                        <div
                          key={n._id}
                          className={`p-3 flex gap-2.5 transition-colors ${isPending ? 'bg-indigo-500/10' : 'hover:bg-[var(--surface-hover)]'}`}
                        >
                          <div className="p-1.5 bg-[var(--surface-subtle)] rounded-lg shrink-0 h-fit mt-0.5 border border-[var(--line)]">
                            {getNotificationIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`font-semibold truncate ${isPending ? 'text-[var(--ink-heading)]' : 'text-[var(--ink)]'}`}>
                                {n.title}
                              </p>
                              <span className="text-[10px] font-mono text-[var(--muted)] shrink-0">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--muted)] leading-snug">{n.message}</p>

                            {/* Accept / Reject buttons for pending team invites */}
                            {n.type === 'team_invite' && n.status === 'pending' && (
                              <div className="flex items-center gap-1.5 pt-1">
                                <button
                                  onClick={() => handleAcceptInvite(n._id)}
                                  disabled={isActing}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white text-[11px] font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                  {isActing ? (
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRejectInvite(n._id)}
                                  disabled={isActing}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-[11px] font-semibold rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Decline
                                </button>
                              </div>
                            )}

                            {/* Accept / Reject buttons for pending judge invites */}
                            {n.type === 'judge_invite' && n.status === 'pending' && (
                              <div className="flex items-center gap-1.5 pt-1">
                                <button
                                  onClick={() => handleAcceptInvite(n._id)}
                                  disabled={isActing}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 text-white text-[11px] font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                  {isActing ? (
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                  Accept Role
                                </button>
                                <button
                                  onClick={() => handleRejectInvite(n._id)}
                                  disabled={isActing}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-[11px] font-semibold rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Decline
                                </button>
                              </div>
                            )}

                            {/* Status badge for resolved invites */}
                            {(n.type === 'team_invite' || n.type === 'judge_invite') && n.status !== 'pending' && (
                              <span className={`text-[10px] font-semibold ${getStatusColor(n.status)}`}>
                                {n.status === 'accepted' ? '✓ Accepted' : '✗ Declined'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                  <Link
                    to={(!user || user.role === 'participant') ? "/hackathons" : "/dashboard"}
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline"
                  >
                    {(!user || user.role === 'participant') ? "View All Platform Events →" : "Go to Dashboard →"}
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile / Auth Button */}
        {isAuthenticated ? (
          <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-white/10 shrink-0">
            <Link
              to="/profile"
              className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title="View Profile"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
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
              <span className="hidden md:inline text-xs font-medium text-slate-800 dark:text-slate-200">
                {user?.name?.split(' ')[0]}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 sm:gap-1.5 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-white/10 shrink-0">
            <Link to="/login">
              <Button size="sm" variant="ghost" className="px-2 sm:px-3 text-xs">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" variant="secondary" className="px-2 sm:px-3 text-xs">
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
