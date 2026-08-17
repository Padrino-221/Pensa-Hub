import { NavLink } from 'react-router-dom';
import {
  CalendarCheck,
  Coins,
  EnvelopeSimple,
  GearSix,
  Scroll,
  SignOut,
  SquaresFour,
  UserGear,
  Users,
  X,
} from '@phosphor-icons/react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useSection } from '../../hooks/useSiteSettings';
import { siteDefaults } from '../../data/siteDefaults';
import { canManageSettings, canViewAttendance, canViewAudit, canViewFinance, canViewMessages, canViewUsers } from '../../lib/permissions';
import { initials } from '../../lib/utils';
import { ROLE_LABELS } from '../../types';
import type { Role } from '../../types';
import type { ReactNode } from 'react';

interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
  visible: (role: Role) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <SquaresFour size={20} />, visible: () => true },
  { path: '/members', label: 'Members', icon: <Users size={20} />, visible: (r) => r !== 'finance_secretary' },
  { path: '/attendance', label: 'Attendance', icon: <CalendarCheck size={20} />, visible: canViewAttendance },
  { path: '/finance', label: 'Finance', icon: <Coins size={20} />, visible: canViewFinance },
  { path: '/users', label: 'Users', icon: <UserGear size={20} />, visible: canViewUsers },
  { path: '/audit', label: 'Audit Logs', icon: <Scroll size={20} />, visible: canViewAudit },
  { path: '/messages', label: 'Messages', icon: <EnvelopeSimple size={20} />, visible: canViewMessages },
  { path: '/settings', label: 'Settings', icon: <GearSix size={20} />, visible: canManageSettings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const branding = useSection('branding', siteDefaults.branding);

  if (!user) return null;

  const items = NAV_ITEMS.filter((i) => i.visible(user.role));

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      toast.error('Failed to log out');
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-ink text-white flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <img
            src={branding.logo || '/logo.png'}
            alt="PU-HUB logo"
            className="w-10 h-10 object-contain shrink-0"
          />
          <div className="min-w-0">
            <p className="font-display font-extrabold text-white leading-tight">{branding.brandName || 'PU-HUB'}</p>
            <p className="text-[11px] text-white/60 truncate">{branding.brandTagline || 'PENSA UENR Hub'}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/70"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-accent-cream'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-royal flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {initials(user.full_name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
              <p className="text-[11px] text-white/60 truncate">{ROLE_LABELS[user.role]}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Log out"
            >
              <SignOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
