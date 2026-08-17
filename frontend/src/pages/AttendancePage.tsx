import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CalendarBlank,
  CalendarPlus,
  FloppyDisk,
  GenderFemale,
  GenderMale,
  MagnifyingGlass,
  MicrophoneStage,
  ShieldCheck,
  TrashSimple,
  Users,
  WarningCircle,
} from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Combobox } from '../components/ui/Combobox';
import { Modal } from '../components/ui/Modal';
import { ConfirmAlert } from '../components/ui/ConfirmAlert';
import { Table } from '../components/ui/Table';
import { attendance } from '../services/api';
import { canDelete } from '../lib/permissions';
import { errMsg, formatDate, formatDateTime, todayISO } from '../lib/utils';
import type { AttendanceSession } from '../types';

const SERVICE_TYPES = ['Sunday Service', 'Bible Study', 'Midweek Service', 'Prayer Meeting', 'Crusade'];

const CHALLENGE_OPTIONS = [
  'Low Attendance',
  'Venue Issues',
  'Technical Issues',
  'Financial Constraints',
  'Time Management',
  'Member Indiscipline',
  'Logistics',
  'Administrative Issues',
  'None',
  'Other',
];

const ATTITUDE_OPTIONS = ['Excellent', 'Good', 'Fair', 'Indifferent'];

function CreateSessionModal({ open, onClose, onCreated }: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]!);
  const [title, setTitle] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!serviceType.trim()) {
      toast.error('Service type is required');
      return;
    }
    setSaving(true);
    try {
      await attendance.createSession({ date, service_type: serviceType.trim(), title: title.trim() || null });
      toast.success('Session created');
      onClose();
      onCreated();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Attendance Session"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="session-form" loading={saving}>Create session</Button>
        </>
      }
    >
      <form id="session-form" onSubmit={submit} className="flex flex-col gap-4">
        <DatePicker label="Session date" value={date} onChange={setDate} />
        <Combobox
          label="Service type"
          placeholder="e.g. Sunday Service"
          value={serviceType}
          onChange={setServiceType}
          options={SERVICE_TYPES}
          required
        />
        <Input
          label="Title (optional)"
          placeholder="e.g. Empowerment Sunday"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </form>
    </Modal>
  );
}

export function AttendancePage() {
  const { user } = useAuth();
  const toast = useToast();
  const role = user!.role;
  const canDeleteRow = canDelete(role);

  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<AttendanceSession | null>(null);
  const [deletingSession, setDeletingSession] = useState<AttendanceSession | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  // Report form state
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [totalAttendance, setTotalAttendance] = useState('');
  const [totalMales, setTotalMales] = useState('');
  const [totalFemales, setTotalFemales] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [topic, setTopic] = useState('');
  const [attitude, setAttitude] = useState('Excellent');
  const [challenges, setChallenges] = useState('None');
  const [challengeOther, setChallengeOther] = useState('');
  const [remarks, setRemarks] = useState('');

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      setSessions(await attendance.listSessions());
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const openSession = useCallback(async (session: AttendanceSession) => {
    setActive(session);
    setDetailLoading(true);
    try {
      const detail = await attendance.getSession(session.id);
      setTotalAttendance(detail.total_attendance != null ? String(detail.total_attendance) : '');
      setTotalMales(detail.total_males != null ? String(detail.total_males) : '');
      setTotalFemales(detail.total_females != null ? String(detail.total_females) : '');
      setSpeaker(detail.speaker ?? '');
      setTopic(detail.topic ?? '');
      const challengeVal = detail.challenges ?? '';
      if (challengeVal === '' || CHALLENGE_OPTIONS.includes(challengeVal)) {
        setChallenges(challengeVal || 'None');
        setChallengeOther('');
      } else {
        setChallenges('Other');
        setChallengeOther(challengeVal);
      }
      setAttitude(detail.attitude_of_executives ?? 'Excellent');
      setRemarks(detail.remarks ?? '');
    } catch (e) {
      toast.error(errMsg(e));
      setActive(null);
    } finally {
      setDetailLoading(false);
    }
  }, [toast]);

  const saveReport = async () => {
    if (!active) return;
    const nAttendance = totalAttendance === '' ? null : Number(totalAttendance);
    const nMales = totalMales === '' ? null : Number(totalMales);
    const nFemales = totalFemales === '' ? null : Number(totalFemales);
    if (
      nAttendance != null && nMales != null && nFemales != null &&
      nMales + nFemales > nAttendance
    ) {
      toast.error('Male + female count cannot exceed total attendance');
      return;
    }
    setSaving(true);
    try {
      const challengesValue = challenges === 'Other' ? challengeOther.trim() : challenges;
      await attendance.updateSession(active.id, {
        total_attendance: nAttendance,
        total_males: nMales,
        total_females: nFemales,
        speaker: speaker.trim() || null,
        topic: topic.trim() || null,
        challenges: challengesValue || null,
        attitude_of_executives: attitude,
        remarks: remarks.trim() || null,
      });
      toast.success('Session report saved');
      await openSession(active);
      await loadSessions();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteSession = async () => {
    if (!deletingSession) return;
    setDeletingBusy(true);
    try {
      await attendance.removeSession(deletingSession.id);
      toast.success('Session deleted');
      setDeletingSession(null);
      await loadSessions();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setDeletingBusy(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (s.title ?? '').toLowerCase().includes(q) || s.service_type.toLowerCase().includes(q);
  });

  // ---- Detail view (session report) ----
  if (active) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            onClick={() => setActive(null)}
            className="flex items-center gap-2 text-sm font-bold text-ink-soft hover:text-ink transition-colors w-fit"
          >
            <ArrowLeft size={16} /> All sessions
          </button>
          <div className="sm:ml-auto flex flex-wrap gap-3">
            <Badge variant="info"><CalendarBlank size={12} /> {formatDate(active.date)}</Badge>
            <Badge variant="accent">{active.service_type}</Badge>
          </div>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-royal mb-1">Session Report</p>
          <h2 className="font-display font-extrabold text-2xl text-ink">
            {active.title || active.service_type}
          </h2>
          <p className="text-sm text-ink-soft mt-0.5">Record the headcount and details for this service.</p>
        </div>

        {detailLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-[18px] border border-ink/15 p-6 h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Headcount */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Card className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-ink-soft uppercase tracking-wide">Total Attendance</p>
                  <div className="w-10 h-10 rounded-[12px] bg-royal/10 text-royal flex items-center justify-center shrink-0">
                    <Users size={20} weight="bold" />
                  </div>
                </div>
                <Input
                  type="number"
                  min={0}
                  placeholder="Total attendees"
                  value={totalAttendance}
                  onChange={(e) => setTotalAttendance(e.target.value)}
                />
              </Card>
              <Card className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-ink-soft uppercase tracking-wide">Total Males</p>
                  <div className="w-10 h-10 rounded-[12px] bg-royal/10 text-royal flex items-center justify-center shrink-0">
                    <GenderMale size={20} weight="bold" />
                  </div>
                </div>
                <Input
                  type="number"
                  min={0}
                  placeholder="Male count"
                  value={totalMales}
                  onChange={(e) => setTotalMales(e.target.value)}
                />
              </Card>
              <Card className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-ink-soft uppercase tracking-wide">Total Females</p>
                  <div className="w-10 h-10 rounded-[12px] bg-accent-cream/40 text-accent flex items-center justify-center shrink-0">
                    <GenderFemale size={20} weight="bold" />
                  </div>
                </div>
                <Input
                  type="number"
                  min={0}
                  placeholder="Female count"
                  value={totalFemales}
                  onChange={(e) => setTotalFemales(e.target.value)}
                />
              </Card>
            </div>

            {/* Service & speaker details */}
            <Card className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-ink/10">
                <div className="w-8 h-8 rounded-[10px] bg-royal/10 text-royal flex items-center justify-center">
                  <BookOpen size={16} weight="bold" />
                </div>
                <h3 className="font-display font-extrabold text-ink">Service & Speaker Details</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Speaker name"
                  placeholder="Enter guest or resident speaker…"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  icon={<MicrophoneStage size={16} />}
                />
                <Input
                  label="Topic / Sermon theme"
                  placeholder="e.g. Grace and Leadership"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  icon={<BookOpen size={16} />}
                />
              </div>
              <Select
                label="Attitude of executives"
                options={ATTITUDE_OPTIONS.map((o) => ({ value: o, label: o }))}
                value={attitude}
                onChange={(e) => setAttitude(e.target.value)}
              />
            </Card>

            {/* Challenges & remarks */}
            <Card className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-ink/10">
                <div className="w-8 h-8 rounded-[10px] bg-danger-bg text-danger flex items-center justify-center">
                  <WarningCircle size={16} weight="bold" />
                </div>
                <h3 className="font-display font-extrabold text-ink">Ministry Diagnosis & Remarks</h3>
              </div>
              <Select
                label="Challenges encountered"
                options={CHALLENGE_OPTIONS.map((o) => ({ value: o, label: o }))}
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
              />
              {challenges === 'Other' && (
                <textarea
                  placeholder="Describe the challenge…"
                  value={challengeOther}
                  onChange={(e) => setChallengeOther(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-ink/20 rounded-[12px] px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal resize-y"
                />
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-ink">Remarks</label>
                <textarea
                  placeholder="Provide additional remarks, decisions, or action points…"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-ink/20 rounded-[12px] px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal resize-y"
                />
              </div>
            </Card>

            <div className="flex justify-end">
              <Button onClick={saveReport} loading={saving} icon={<FloppyDisk size={16} weight="bold" />}>
                Save session report
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ---- List view ----
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-royal mb-1">
            Service Tracking
          </p>
          <h2 className="font-display font-extrabold text-2xl text-ink">Attendance Sessions</h2>
          <p className="text-sm text-ink-soft mt-0.5">Record headcount and details for each service.</p>
        </div>
        <Button icon={<CalendarPlus size={16} weight="bold" />} onClick={() => setCreateOpen(true)} className="sm:ml-auto">
          New Session
        </Button>
      </div>

      {sessions.length > 0 && (
        <div className="flex items-center gap-3 bg-white border border-ink/15 rounded-[16px] px-4 py-3">
          <MagnifyingGlass size={18} className="text-muted-blue shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by session title or service type…"
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs font-bold text-ink-soft hover:text-ink shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {(loading || sessions.length > 0) && (
        <Card padding={false}>
          <Table<AttendanceSession>
            data={loading ? [] : filteredSessions}
            emptyMessage={loading ? 'Loading…' : 'No matching sessions found.'}
            pageSize={10}
          columns={[
            {
              key: 'title',
              header: 'Session',
              render: (s) => (
                <div className="flex flex-col">
                  <span className="font-bold text-ink-black">{s.title || s.service_type}</span>
                  {s.title && (
                    <span className="text-xs font-bold text-royal uppercase tracking-wide mt-0.5 w-fit">
                      {s.service_type}
                    </span>
                  )}
                </div>
              ),
            },
            { key: 'date', header: 'Date', render: (s) => <span className="font-bold text-ink-black">{formatDate(s.date)}</span> },
            {
              key: 'total_attendance',
              header: 'Attendance',
              render: (s) =>
                s.total_attendance != null
                  ? <span className="font-bold text-ink-black">{s.total_attendance} present</span>
                  : <span className="text-ink-soft">—</span>,
            },
            { key: 'created_at', header: 'Created', render: (s) => formatDateTime(s.created_at) },
            {
              key: 'actions',
              header: '',
              className: 'w-40',
              render: (s) => (
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="secondary" onClick={() => openSession(s)}>
                    Enter
                  </Button>
                  {canDeleteRow && (
                    <button
                      onClick={() => setDeletingSession(s)}
                      className="p-2 rounded-full text-ink-soft hover:text-danger hover:bg-danger-bg transition-colors"
                      title="Delete session"
                    >
                      <TrashSimple size={16} />
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          />
        </Card>
      )}

      {sessions.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center text-center bg-white border border-ink/15 rounded-[18px] py-14 px-6">
          <div className="w-14 h-14 rounded-[16px] bg-royal/10 text-royal flex items-center justify-center mb-4">
            <ShieldCheck size={28} weight="duotone" />
          </div>
          <h3 className="font-display font-extrabold text-ink text-lg">No active sessions found</h3>
          <p className="text-sm text-ink-soft max-w-xs mt-1">
            Start your first attendance session to begin tracking engagement.
          </p>
        </div>
      )}

      <CreateSessionModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={loadSessions} />

      <ConfirmAlert
        open={deletingSession !== null}
        onClose={() => setDeletingSession(null)}
        onConfirm={confirmDeleteSession}
        loading={deletingBusy}
        title="Delete session"
        message={`Delete the ${deletingSession?.service_type ?? ''} session on ${deletingSession ? formatDate(deletingSession.date) : ''}? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
