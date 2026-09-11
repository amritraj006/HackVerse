import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Menu, Code2, Plus, CheckCheck,
  Sparkles, Trophy, Info, Check, XCircle, UserCheck, Scale,
} from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/notificationService';
import { notify } from '../utils/toast';


export const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const popoverRef = useRef(null);
  const avatarUrl = user?.avatar;

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setNotifLoading(true);
    try {
      const res = await notificationService.getAll();
      if (res && res.data) setNotifications(res.data);
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
          if (!cancelled && res?.data) setNotifications(res.data);
        } catch {
          // Silently fail
        }
      };
      load();
    }
    return () => { cancelled = true; };
  }, [isAuthenticated]);

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
      setNotifications((prev) => prev.map((n) => (n._id === notifId ? { ...n, status: 'accepted' } : n)));
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
      setNotifications((prev) => prev.map((n) => (n._id === notifId ? { ...n, status: 'rejected' } : n)));
      notify.info('Invitation declined.');
    } catch (err) {
      notify.error(err.message || 'Failed to reject invitation');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'team_invite':  return <UserCheck className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />;
      case 'judge_invite': return <Scale     className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />;
      case 'hackathon':    return <Trophy    className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />;
      default:             return <Sparkles  className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />;
    }
  };

  const getStatusColor = (status) => {
    if (status === 'accepted') return '#10b981';
    if (status === 'rejected') return '#f43f5e';
    return 'var(--text-muted)';
  };

  return (
    <header
      className="sticky top-0 z-30 px-4 py-2.5 flex items-center justify-between"
      style={{
        background: 'rgba(7,11,20,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      {/* Left: Brand + sidebar toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg transition-colors md:hidden cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <Link to="/" className="flex items-center gap-2 group">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-lg transition-all duration-200 group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 16px rgba(99,102,241,0.4)',
            }}
          >
            <Code2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight gradient-text group-hover:opacity-80 transition-opacity">
            HackVerse
          </span>
          <span
            className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border"
            style={{
              background: 'rgba(99,102,241,0.12)',
              color: '#818cf8',
              borderColor: 'rgba(99,102,241,0.25)',
            }}
          >
            Platform
          </span>
        </Link>
      </div>

      {/* Right: Actions & Profile */}
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

        {/* Notifications */}
        {isAuthenticated && (
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => {
                setShowNotifications((prev) => !prev);
                if (!showNotifications) fetchNotifications();
              }}
              className="relative p-2 rounded-lg transition-all duration-150 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse-slow"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 0 8px rgba(99,102,241,0.5)',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl z-50 overflow-hidden text-xs animate-fade-in"
                style={{
                  background: 'rgba(13,18,32,0.98)',
                  border: '1px solid var(--border-normal)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Header */}
                <div
                  className="p-3 flex items-center justify-between"
                  style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}
                >
                  <div className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--text-primary)' }}>
                    <Bell className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span
                        className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full"
                        style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}
                      >
                        {unreadCount} pending
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                      style={{ color: '#818cf8' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <CheckCheck className="w-3 h-3" /> Read all
                    </button>
                  )}
                </div>

                {/* Notification Items */}
                <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                  {notifLoading ? (
                    <div className="py-8 text-center space-y-2">
                      <div
                        className="w-5 h-5 rounded-full border-2 border-t-transparent mx-auto"
                        style={{ borderColor: '#6366f1', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}
                      />
                      <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-8 text-center space-y-1">
                      <Info className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                      <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No notifications</p>
                      <p style={{ color: 'var(--text-muted)' }}>You're all caught up!</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const isPending = n.status === 'pending';
                      const isActing = actionLoadingId === n._id;
                      return (
                        <div
                          key={n._id}
                          className="p-3 flex gap-2.5"
                          style={{ background: isPending ? 'rgba(99,102,241,0.04)' : 'transparent' }}
                        >
                          <div
                            className="p-1.5 rounded-lg shrink-0 h-fit mt-0.5"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)' }}
                          >
                            {getNotificationIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <p
                                className="font-semibold truncate"
                                style={{ color: isPending ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                              >
                                {n.title}
                              </p>
                              <span className="text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[11px] leading-snug" style={{ color: 'var(--text-muted)' }}>
                              {n.message}
                            </p>

                            {/* Accept/Reject for team_invite */}
                            {n.type === 'team_invite' && n.status === 'pending' && (
                              <div className="flex items-center gap-1.5 pt-1">
                                <button
                                  onClick={() => handleAcceptInvite(n._id)}
                                  disabled={isActing}
                                  className="flex items-center gap-1 px-2.5 py-1 text-white text-[11px] font-semibold rounded-lg disabled:opacity-50 transition-all cursor-pointer"
                                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                                >
                                  {isActing
                                    ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full inline-block" style={{ animation: 'spin 0.8s linear infinite' }} />
                                    : <Check className="w-3 h-3" />}
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRejectInvite(n._id)}
                                  disabled={isActing}
                                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg disabled:opacity-50 transition-all cursor-pointer"
                                  style={{ background: 'rgba(244,63,94,0.1)', color: '#fca5a5', border: '1px solid rgba(244,63,94,0.25)' }}
                                >
                                  <XCircle className="w-3 h-3" /> Decline
                                </button>
                              </div>
                            )}

                            {/* Accept/Reject for judge_invite */}
                            {n.type === 'judge_invite' && n.status === 'pending' && (
                              <div className="flex items-center gap-1.5 pt-1">
                                <button
                                  onClick={() => handleAcceptInvite(n._id)}
                                  disabled={isActing}
                                  className="flex items-center gap-1 px-2.5 py-1 text-white text-[11px] font-semibold rounded-lg disabled:opacity-50 transition-all cursor-pointer"
                                  style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
                                >
                                  {isActing
                                    ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full inline-block" style={{ animation: 'spin 0.8s linear infinite' }} />
                                    : <Check className="w-3 h-3" />}
                                  Accept Role
                                </button>
                                <button
                                  onClick={() => handleRejectInvite(n._id)}
                                  disabled={isActing}
                                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg disabled:opacity-50 transition-all cursor-pointer"
                                  style={{ background: 'rgba(244,63,94,0.1)', color: '#fca5a5', border: '1px solid rgba(244,63,94,0.25)' }}
                                >
                                  <XCircle className="w-3 h-3" /> Decline
                                </button>
                              </div>
                            )}

                            {/* Status badge for resolved invites */}
                            {(n.type === 'team_invite' || n.type === 'judge_invite') && n.status !== 'pending' && (
                              <span
                                className="text-[10px] font-semibold"
                                style={{ color: getStatusColor(n.status) }}
                              >
                                {n.status === 'accepted' ? '✓ Accepted' : '✗ Declined'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer link */}
                <div
                  className="p-2 text-center"
                  style={{ borderTop: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}
                >
                  <Link
                    to={(!user || user.role === 'participant') ? '/hackathons' : '/dashboard'}
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] font-semibold transition-colors"
                    style={{ color: '#818cf8' }}
                  >
                    {(!user || user.role === 'participant') ? 'View All Platform Events →' : 'Go to Dashboard →'}
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile / Auth */}
        {isAuthenticated ? (
          <div
            className="flex items-center gap-2 pl-3"
            style={{ borderLeft: '1px solid var(--border-subtle)' }}
          >
            <Link
              to="/profile"
              className="flex items-center gap-2 p-1 rounded-lg transition-all duration-150"
              title="View Profile"
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div
                className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 0 10px rgba(99,102,241,0.4)',
                  border: '2px solid rgba(99,102,241,0.3)',
                }}
              >
                {avatarUrl ? (
                  <img
                    src={
                      avatarUrl.startsWith('http') || avatarUrl.startsWith('blob:')
                        ? avatarUrl
                        : `${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}${avatarUrl}`
                    }
                    alt={user?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
              <span className="hidden lg:inline text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {user?.name?.split(' ')[0]}
              </span>
            </Link>
            <button
              onClick={logout}
              className="text-xs font-medium transition-colors cursor-pointer px-2 py-1 rounded-lg"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#f43f5e'; e.currentTarget.style.background = 'rgba(244,63,94,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 pl-2">
            <Link to="/login">
              <Button size="sm" variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" variant="primary">Register</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
