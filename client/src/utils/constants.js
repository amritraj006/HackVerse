import {
  LayoutDashboard,
  Trophy,
  FolderGit2,
  Users,
  Settings,
  HelpCircle,
} from 'lucide-react';

export const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Hackathons', path: '/hackathons', icon: Trophy },
  { name: 'Projects', path: '/projects', icon: FolderGit2 },
  { name: 'Teams', path: '/teams', icon: Users },
];

export const SECONDARY_NAV_ITEMS = [
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Help & Docs', path: '/help', icon: HelpCircle },
];

export const STATUS_COLORS = {
  upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
  ongoing: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ended: 'bg-slate-100 text-slate-700 border-slate-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
};
