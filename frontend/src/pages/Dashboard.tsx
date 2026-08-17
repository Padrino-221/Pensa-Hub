import { useEffect, useState, type ReactNode } from 'react';
import {
  CalendarCheck,
  Coins,
  GraduationCap,
  PiggyBank,
  Scroll,
  TrendDown,
  TrendUp,
  UserGear,
  Users,
  UsersThree,
} from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { attendance, finance, members, users } from '../services/api';
import {
  canViewAttendance,
  canViewAudit,
  canViewFinance,
  canViewUsers,
  memberScopes,
} from '../lib/permissions';
import { errMsg, formatMoney } from '../lib/utils';
import { ROLE_LABELS } from '../types';
import type { AttendanceSession, FinancialSummary, Member, User } from '../types';

interface Stat {
  label: string;
  value: string;
  icon: ReactNode;
  iconClass: string;
}

const ICON_CLASSES = {
  navy: 'bg-ink/[0.07] text-ink',
  primary: 'bg-royal/10 text-royal',
  accent: 'bg-accent-cream/40 text-accent',
  success: 'bg-success-bg text-success',
  danger: 'bg-danger-bg text-danger',
  info: 'bg-royal/10 text-royal-400',
};

function StatCard({ stat }: { stat: Stat }) {
  return (
    <Card className="flex items-start gap-4">
      <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 ${stat.iconClass}`}>
        {stat.icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-ink-soft uppercase tracking-wide">{stat.label}</p>
        <p className="font-display font-extrabold text-2xl text-ink mt-0.5 truncate">{stat.value}</p>
      </div>
    </Card>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const role = user!.role;

  const [loading, setLoading] = useState(true);
  const [membersData, setMembersData] = useState<Member[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [usersData, setUsersData] = useState<User[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const scopes = memberScopes(role);
        const lists = await Promise.all(scopes.map((s) => members.list(s)));
        if (cancelled) return;

        const all = lists.flat();
        setMembersData(all);

        if (canViewAttendance(role)) {
          setSessions(await attendance.listSessions());
        }
        if (canViewFinance(role)) {
          setSummary(await finance.summary());
        }
        if (canViewUsers(role)) {
          setUsersData(await users.list());
        }
      } catch (e) {
        toast.error(errMsg(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [role, toast]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-[18px] border border-ink/15 p-6 h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  const students = membersData.filter((m) => m.member_type === 'student');
  const scopes = memberScopes(role);

  const stats: Stat[] = [];

  if (scopes.length > 0) {
    stats.push({
      label: 'Total Members',
      value: String(membersData.length),
      icon: scopes.length > 1 ? <UsersThree size={22} /> : <Users size={22} />,
      iconClass: ICON_CLASSES.primary,
    });
    if (scopes.length > 1) {
      stats.push({
        label: 'Students',
        value: String(students.length),
        icon: <GraduationCap size={22} />,
        iconClass: ICON_CLASSES.accent,
      });
    }
  }

  if (canViewAttendance(role)) {
    stats.push({
      label: 'Attendance Sessions',
      value: String(sessions.length),
      icon: <CalendarCheck size={22} />,
      iconClass: ICON_CLASSES.success,
    });
  }

  if (canViewFinance(role) && summary) {
    stats.push({
      label: 'Balance',
      value: formatMoney(summary.balance),
      icon: <PiggyBank size={22} />,
      iconClass: ICON_CLASSES.navy,
    });
    stats.push({
      label: 'Expenses',
      value: formatMoney(summary.total_expenses),
      icon: <TrendDown size={22} />,
      iconClass: ICON_CLASSES.danger,
    });
    stats.push({
      label: 'Income',
      value: formatMoney(summary.total_income),
      icon: <TrendUp size={22} />,
      iconClass: ICON_CLASSES.success,
    });
  }

  if (canViewUsers(role)) {
    stats.push({
      label: 'Accounts',
      value: String(usersData.length),
      icon: <UserGear size={22} />,
      iconClass: ICON_CLASSES.info,
    });
  }

  if (canViewAudit(role)) {
    stats.push({
      label: 'Oversight',
      value: 'Enabled',
      icon: <Scroll size={22} />,
      iconClass: ICON_CLASSES.accent,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-royal mb-1">
            Church Overview
          </p>
          <h2 className="font-display font-extrabold text-2xl text-ink">
            Welcome back, {user!.full_name.split(' ')[0]}
          </h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Here's what's happening across the church today.
          </p>
        </div>
        <Badge variant="accent" className="sm:ml-auto self-start">
          {ROLE_LABELS[role]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>

      {canViewFinance(role) && summary && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Coins size={18} className="text-royal" />
            <h3 className="font-display font-extrabold text-ink">Income breakdown</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(['tithe', 'offering', 'dues', 'expense'] as const).map((t) => (
              <div key={t} className="rounded-[14px] bg-ink/[0.04] p-4">
                <p className="text-xs font-bold text-ink-soft uppercase tracking-wide capitalize">{t}</p>
                <p className={`font-display font-extrabold text-lg mt-1 ${t === 'expense' ? 'text-danger' : 'text-ink'}`}>
                  {formatMoney(summary.by_type[t])}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
