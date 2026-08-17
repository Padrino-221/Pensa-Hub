import { useCallback, useEffect, useRef, useState } from 'react';
import { Scroll } from '@phosphor-icons/react';
import { useToast } from '../contexts/ToastContext';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { audit, users } from '../services/api';
import { errMsg, formatDateTime } from '../lib/utils';
import type { AuditLog, User } from '../types';

const POLL_MS = 5000;

function actionVariant(action: string): 'danger' | 'success' | 'warning' | 'info' {
  if (action.includes('deleted')) return 'danger';
  if (action.includes('created')) return 'success';
  if (action.includes('updated')) return 'warning';
  return 'info';
}

function friendlyAction(action: string): string {
  const map: Record<string, string> = {
    'member.created': 'Member created',
    'member.updated': 'Member updated',
    'member.deleted': 'Member deleted',
    'member.promoted': 'Member promoted',
    'attendance.session_created': 'Session created',
    'attendance.session_updated': 'Session updated',
    'attendance.session_deleted': 'Session deleted',
    'attendance.record_created': 'Attendance recorded',
    'attendance.record_updated': 'Attendance updated',
    'attendance.record_deleted': 'Attendance deleted',
    'finance.transaction_created': 'Transaction created',
    'finance.transaction_updated': 'Transaction updated',
    'finance.transaction_deleted': 'Transaction deleted',
    'user.created': 'Account created',
    'user.updated': 'Account updated',
    'user.deleted': 'Account deleted',
    'settings.updated': 'Website content updated',
    'auth.login': 'Login',
    'auth.logout': 'Logout',
  };
  return map[action] ?? action;
}

export function AuditLogsPage() {
  const toast = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, User>>(new Map());
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const knownIds = useRef<Set<string>>(new Set());

  const fetchFeed = useCallback(async (silent = false) => {
    try {
      const [logList, userList] = await Promise.all([audit.list(200), users.list()]);
      setUsersMap(new Map(userList.map((u) => [u.id, u])));
      const incoming = logList.filter((l) => !knownIds.current.has(l.id));
      if (incoming.length > 0) {
        // Incoming rows are newest-first; mark the ones we haven't seen.
        setFresh(new Set(incoming.map((l) => l.id)));
        knownIds.current = new Set(logList.map((l) => l.id));
        setLogs((prev) => {
          const merged = [...prev.filter((l) => !knownIds.current.has(l.id)), ...logList];
          // dedupe + keep newest-first
          const seen = new Set<string>();
          const out: AuditLog[] = [];
          for (const l of merged) {
            if (!seen.has(l.id)) { seen.add(l.id); out.push(l); }
          }
          return out;
        });
        setTimeout(() => setFresh(new Set()), 4000);
      } else {
        knownIds.current = new Set(logList.map((l) => l.id));
      }
      setLive(true);
    } catch (e) {
      if (!silent) toast.error(errMsg(e));
      setLive(false);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFeed();
    const timer = setInterval(() => fetchFeed(true), POLL_MS);
    return () => clearInterval(timer);
  }, [fetchFeed]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-[14px] bg-ink/[0.07] text-ink flex items-center justify-center">
          <Scroll size={22} />
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-royal mb-1">
            Activity Trail
          </p>
          <h2 className="font-display font-extrabold text-2xl text-ink">Audit Logs</h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Every mutation across members, attendance, finance, accounts, and website content. Super Admin only.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {live && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success bg-success-bg rounded-full px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              Live
            </span>
          )}
        </div>
      </div>

      <Card padding={false}>
        <Table<AuditLog>
          data={loading ? [] : logs}
          emptyMessage={loading ? 'Loading…' : 'No audit events recorded yet.'}
          pageSize={15}
          rowClassName={(l) =>
            fresh.has(l.id) ? 'animate-flash' : undefined
          }
          columns={[
            { key: 'timestamp', header: 'Time', render: (l) => <span className="font-bold text-ink-black">{formatDateTime(l.timestamp)}</span> },
            {
              key: 'user',
              header: 'User',
              render: (l) => usersMap.get(l.user_id)?.full_name ?? l.user_id.slice(0, 8),
            },
            {
              key: 'action',
              header: 'Action',
              render: (l) => <Badge variant={actionVariant(l.action)}>{friendlyAction(l.action)}</Badge>,
            },
            {
              key: 'target_table',
              header: 'Target',
              render: (l) => <span className="text-ink-soft">{l.target_table ?? '—'}</span>,
            },
            { key: 'target_id', header: 'Target ID', render: (l) => <span className="font-mono text-xs text-ink-soft">{l.target_id ?? '—'}</span> },
          ]}
        />
      </Card>
    </div>
  );
}
