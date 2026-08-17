import { useLocation, useNavigate } from 'react-router-dom';
import { List, SignOut } from '@phosphor-icons/react';
import { useAuth } from '../../contexts/AuthContext';
import { Dropdown } from '../ui/Dropdown';
import { ROLE_LABELS } from '../../types';
import { initials } from '../../lib/utils';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/members': 'Members',
  '/attendance': 'Attendance',
  '/finance': 'Finance',
  '/users': 'User Management',
  '/audit': 'Audit Logs',
  '/settings': 'Settings',
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const title = TITLES[location.pathname] ?? 'PU-HUB';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      // ignore — session state still clears
    }
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 bg-white/90 backdrop-blur border-b border-ink/10 px-6 lg:px-8 h-16">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 rounded-full text-ink-soft hover:bg-ink/5 transition-colors"
        aria-label="Open menu"
      >
        <List size={22} />
      </button>
      <h1 className="font-display font-extrabold text-lg text-ink">{title}</h1>

      <div className="ml-auto">
        <Dropdown
          trigger={
            <button className="flex items-center gap-3 p-1.5 pr-2 rounded-full hover:bg-ink/5 transition-colors">
              <div className="w-9 h-9 rounded-full bg-royal flex items-center justify-center text-white text-xs font-semibold">
                {initials(user.full_name)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-ink leading-tight">{user.full_name}</p>
                <p className="text-[11px] text-ink-soft leading-tight">{ROLE_LABELS[user.role]}</p>
              </div>
            </button>
          }
          items={[
            {
              label: 'Log out',
              icon: <SignOut size={16} />,
              onClick: handleLogout,
            },
          ]}
        />
      </div>
    </header>
  );
}