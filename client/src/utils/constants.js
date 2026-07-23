import {
  LayoutDashboard,
  Trophy,
  FolderGit2,
  Users,
  User,
  Shield,
  HelpCircle,
  ClipboardList,
} from 'lucide-react';

export const ALL_NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['participant', 'organizer', 'judge', 'admin'] },
  { name: 'Profile', path: '/profile', icon: User, roles: ['participant', 'organizer', 'judge', 'admin'] },
  { name: 'Hackathons', path: '/hackathons', icon: Trophy, roles: ['participant', 'organizer', 'judge', 'admin'] },
  { name: 'Projects', path: '/projects', icon: FolderGit2, roles: ['participant', 'organizer', 'judge', 'admin'] },
  { name: 'Teams', path: '/teams', icon: Users, roles: ['participant', 'organizer'] },
  { name: 'My Registrations', path: '/registrations', icon: ClipboardList, roles: ['participant'] },
  { name: 'Admin Console', path: '/admin', icon: Shield, roles: ['admin'] },
];

export const SECONDARY_NAV_ITEMS = [
  { name: 'Help & Docs', path: '/help', icon: HelpCircle },
];

export const STATUS_COLORS = {
  upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
  ongoing: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ended: 'bg-slate-100 text-slate-700 border-slate-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
};
