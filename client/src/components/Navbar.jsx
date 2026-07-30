import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Bell, Menu, Code2, Plus, CheckCheck, Trash2, X,
  Sparkles, Trophy, Shield, Info, Check, XCircle, UserCheck, Scale,
} from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/notificationService';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const popoverRef = useRef(null);
  const avatarUrl = user?.avatar;

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
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/hackathons?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowNotifications(false);
    }
  };

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
    } catch (err) {
      alert(err.message || 'Failed to accept invitation');
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
    } catch (err) {
      alert(err.message || 'Failed to reject invitation');
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
        {/* Host Hackathon — only for organizers */}
        {user?.role === 'organizer' && (
          <Link to="/dashboard">
            <Button size="sm" variant="primary">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Host Hackathon</span>
            </Button>
          </Link>
        )}

        {/* Notifications Button & Popover */}
        {isAuthenticated && (
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => {
                setShowNotifications((prev) => !prev);
                if (!showNotifications) fetchNotifications();
              }}
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
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200/90 z-50 overflow-hidden text-xs">
                <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Bell className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                        {unreadCount} pending
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
                  </div>
                </div>

                {/* Notification Items List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
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
                          className={`p-3 flex gap-2.5 ${isPending ? 'bg-indigo-50/40' : 'bg-white'}`}
                        >
                          <div className="p-1.5 bg-slate-100 rounded-lg shrink-0 h-fit mt-0.5">
                            {getNotificationIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`font-semibold truncate ${isPending ? 'text-slate-900' : 'text-slate-700'}`}>
                                {n.title}
                              </p>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug">{n.message}</p>

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
