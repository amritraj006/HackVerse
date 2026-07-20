import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge, Button } from '../common/UI';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Trophy,
  ClipboardCheck,
  FileCode,
  User,
  LogOut,
  Menu,
  X,
  ShieldAlert
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  // Define sidebar links based on user role
  const getSidebarLinks = () => {
    const role = user?.role;
    
    const links = [
      {
        to: '/dashboard',
        label: 'Overview',
        icon: LayoutDashboard,
        roles: ['admin', 'organizer', 'participant', 'judge']
      },
      {
        to: '/hackathons',
        label: 'Hackathons',
        icon: Calendar,
        roles: ['admin', 'organizer', 'participant', 'judge']
      },
      // Admin specific
      {
        to: '/admin/users',
        label: 'User Directory',
        icon: Users,
        roles: ['admin']
      },
      // Organizer specific
      {
        to: '/organizer/registrations',
        label: 'Registrations',
        icon: ClipboardCheck,
        roles: ['organizer']
      },
      {
        to: '/organizer/submissions',
        label: 'Project Submissions',
        icon: FileCode,
        roles: ['organizer']
      },
      // Participant specific
      {
        to: '/participant/teams',
        label: 'My Teams',
        icon: Users,
        roles: ['participant']
      },
      // Judge specific
      {
        to: '/judge/reviews',
        label: 'Assigned Evaluations',
        icon: ClipboardCheck,
        roles: ['judge']
      }
    ];

    return links.filter(link => link.roles.includes(role));
  };

  const activeLinkClass = "flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded bg-primary-50 text-primary-600 border-r-2 border-primary-600";
  const inactiveLinkClass = "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors";

  const roleColors = {
    admin: 'rose',
    organizer: 'purple',
    judge: 'amber',
    participant: 'blue'
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 2L2 22h20L12 2zm0 3.99L18.8 19H5.2L12 5.99z" />
              </svg>
              <span className="font-bold text-base tracking-tight text-gray-900">Hack<span className="text-primary-600">Verse</span></span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-gray-800">{user.name}</span>
                  <span className="text-[10px] text-gray-400 capitalize">{user.role}</span>
                </div>
                <Badge variant={roleColors[user.role] || 'gray'}>
                  {user.role}
                </Badge>
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold capitalize">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
            )}
            <div className="w-px h-6 bg-gray-200"></div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Workspace Panel */}
      <div className="flex flex-1 relative">
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden lg:block w-60 bg-white border-r border-gray-200 p-4 space-y-6">
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Navigation</p>
            {getSidebarLinks().map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? activeLinkClass : inactiveLinkClass)}
                end={link.to === '/dashboard'}
              >
                <link.icon size={16} />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
          
          <div className="pt-6 border-t border-gray-100">
            <NavLink
              to="/profile"
              className={({ isActive }) => (isActive ? activeLinkClass : inactiveLinkClass)}
            >
              <User size={16} />
              <span>My Profile</span>
            </NavLink>
          </div>
        </aside>

        {/* Left Sidebar (Mobile Drawer) */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-gray-600/40 backdrop-blur-[1px]" onClick={() => setSidebarOpen(false)} />
            <aside className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-gray-200 p-4 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-sm text-gray-800">Menu</span>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-1 flex-1">
                {getSidebarLinks().map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => (isActive ? activeLinkClass : inactiveLinkClass)}
                    end={link.to === '/dashboard'}
                  >
                    <link.icon size={16} />
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </div>
              <div className="pt-6 border-t border-gray-100">
                <NavLink
                  to="/profile"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => (isActive ? activeLinkClass : inactiveLinkClass)}
                >
                  <User size={16} />
                  <span>My Profile</span>
                </NavLink>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
