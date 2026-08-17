import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { CheckCircle, DownloadSimple, FileCsv, PencilSimple, Plus, TrashSimple, WarningCircle } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Modal } from '../components/ui/Modal';
import { ConfirmAlert } from '../components/ui/ConfirmAlert';
import { Table } from '../components/ui/Table';
import { members } from '../services/api';
import { canDelete, memberScopes } from '../lib/permissions';
import { errMsg, formatDate, todayISO } from '../lib/utils';
import type { Member, MemberType } from '../types';

const LEVEL_OPTIONS = [100, 200, 300, 400].map((l) => ({ value: String(l), label: `Level ${l}` }));

interface FormState {
  full_name: string;
  phone: string;
  email: string;
  member_type: MemberType;
  program_of_study: string;
  level: string;
  graduation_year: string;
  occupation: string;
  date_joined: string;
  active: boolean;
}

const emptyForm = (memberType: MemberType): FormState => ({
  full_name: '',
  phone: '',
  email: '',
  member_type: memberType,
  program_of_study: '',
  level: '100',
  graduation_year: '',
  occupation: '',
  date_joined: todayISO(),
  active: true,
});

const TYPE_LABELS: Record<MemberType, string> = {
  student: 'Student',
  alumni: 'Alumni',
};

interface MemberFormModalProps {
  open: boolean;
  editing: Member | null;
  fixedType: MemberType | null; // null = role manages both scopes
  onClose: () => void;
  onSaved: () => void;
}

function MemberFormModal({ open, editing, fixedType, onClose, onSaved }: MemberFormModalProps) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(fixedType ?? 'student'));

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        full_name: editing.full_name,
        phone: editing.phone,
        email: editing.email ?? '',
        member_type: editing.member_type,
        program_of_study: editing.program_of_study ?? '',
        level: editing.level != null ? String(editing.level) : '100',
        graduation_year: editing.graduation_year != null ? String(editing.graduation_year) : '',
        occupation: editing.occupation ?? '',
        date_joined: editing.date_joined,
        active: editing.is_active,
      });
    } else {
      setForm(emptyForm(fixedType ?? 'student'));
    }
  }, [open, editing, fixedType]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    setSaving(true);
    try {
      const isStudent = form.member_type === 'student';
      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        member_type: form.member_type,
        program_of_study: isStudent ? form.program_of_study.trim() || null : null,
        level: isStudent ? Number(form.level) || null : null,
        graduation_year: !isStudent && form.graduation_year ? Number(form.graduation_year) : null,
        occupation: !isStudent ? form.occupation.trim() || null : null,
        date_joined: form.date_joined,
      };
      if (editing) {
        const { member_type: _t, ...updatePayload } = payload;
        await members.update(editing.id, { ...updatePayload, is_active: form.active });
        toast.success('Member updated');
      } else {
        await members.create(payload);
        toast.success('Member added');
      }
      onClose();
      onSaved();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const canPickType = !fixedType;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Member' : 'Add Member'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="member-form" loading={saving}>
            {editing ? 'Save changes' : 'Add member'}
          </Button>
        </>
      }
    >
      <form id="member-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Full name"
            placeholder="e.g. Kwame Mensah"
            value={form.full_name}
            onChange={(e) => set('full_name', e.target.value)}
            required
          />
        </div>
        {canPickType && (
          <Select
            label="Member type"
            options={[
              { value: 'student', label: 'Student' },
              { value: 'alumni', label: 'Alumni' },
            ]}
            value={form.member_type}
            onChange={(e) => set('member_type', e.target.value as MemberType)}
          />
        )}
        <Input
          label="Phone"
          placeholder="e.g. 024 000 0000"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="optional"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
        />
        {form.member_type === 'student' ? (
          <>
            <Input
              label="Program of study"
              placeholder="e.g. Renewable Energy Engineering"
              value={form.program_of_study}
              onChange={(e) => set('program_of_study', e.target.value)}
            />
            <Select
              label="Level"
              options={LEVEL_OPTIONS}
              value={form.level}
              onChange={(e) => set('level', e.target.value)}
            />
          </>
        ) : (
          <>
            <Input
              label="Graduation year"
              type="number"
              placeholder="e.g. 2022"
              value={form.graduation_year}
              onChange={(e) => set('graduation_year', e.target.value)}
            />
            <Input
              label="Occupation"
              placeholder="e.g. Software Engineer"
              value={form.occupation}
              onChange={(e) => set('occupation', e.target.value)}
            />
          </>
        )}
        <DatePicker
          label="Date joined"
          value={form.date_joined}
          onChange={(d) => set('date_joined', d)}
        />
        {editing && (
          <div className="sm:col-span-2 flex items-center justify-between gap-3 rounded-[12px] bg-ink/[0.03] border border-ink/10 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-ink">Active member</p>
              <p className="text-xs text-ink-soft">Inactive members are hidden from the roster count.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.active}
              onClick={() => set('active', !form.active)}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${form.active ? 'bg-royal' : 'bg-ink/20'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.active ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
}

function ImportModal({ open, onClose, onImported }: {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: { row: number; error: string }[] } | null>(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setResult(null);
    }
  }, [open]);

  const runImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const res = await members.importCsv(file);
      setResult(res);
      if (res.imported > 0) {
        toast.success(`${res.imported} member${res.imported === 1 ? '' : 's'} imported`);
        onImported();
      }
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Bulk import members" size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={runImport} loading={importing} disabled={!file}>
            Import members
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-soft">
          Upload a CSV file with one member per row. Download the template below to see the exact columns.
        </p>

        <a
          href={members.importTemplate()}
          download
          className="inline-flex items-center gap-2 w-fit text-sm font-bold text-royal hover:underline"
        >
          <DownloadSimple size={16} weight="bold" /> Download CSV template
        </a>

        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) setFile(f);
          }}
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-ink/25 rounded-[14px] px-6 py-10 text-center cursor-pointer hover:border-royal/50 hover:bg-royal/[0.03] transition-colors"
        >
          {file ? (
            <>
              <FileCsv size={28} className="text-success" weight="duotone" />
              <p className="text-sm font-bold text-ink">{file.name}</p>
              <p className="text-xs text-ink-soft">{(file.size / 1024).toFixed(1)} KB — click or drop to replace</p>
            </>
          ) : (
            <>
              <FileCsv size={28} className="text-royal" weight="duotone" />
              <p className="text-sm font-bold text-ink">Click to choose or drop a CSV file</p>
              <p className="text-xs text-ink-soft">Columns: full_name, phone, email, member_type, program_of_study, level, graduation_year, occupation, date_joined</p>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f);
          }}
        />

        {result && (
          <div className="rounded-[14px] border border-ink/15 bg-ink/[0.03] p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <CheckCircle size={18} weight="bold" className="text-success" />
              <p className="font-display font-extrabold text-ink">
                {result.imported} member{result.imported === 1 ? '' : 's'} imported
              </p>
            </div>
            {result.errors.length > 0 ? (
              <div className="flex items-center gap-2 mb-2">
                <WarningCircle size={16} weight="bold" className="text-warning" />
                <p className="text-sm font-bold text-ink">
                  {result.errors.length} row{result.errors.length === 1 ? '' : 's'} skipped:
                </p>
              </div>
            ) : null}
            {result.errors.length > 0 && (
              <ul className="space-y-1 max-h-40 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-xs text-ink-soft">
                    Row {e.row}: <span className="font-semibold text-danger">{e.error}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export function MembersPage() {
  const { user } = useAuth();
  const toast = useToast();
  const role = user!.role;
  const scopes = memberScopes(role);

  const [tab, setTab] = useState<MemberType>(scopes[0] ?? 'student');
  const [data, setData] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState<Member | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await members.list(tab));
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [tab, toast]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (m: Member) => {
    setEditing(m);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await members.remove(deleting.id);
      toast.success('Member deleted');
      setDeleting(null);
      await load();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setDeletingBusy(false);
    }
  };

  const canDeleteRow = canDelete(role);
  const fixedType = scopes.length === 1 ? scopes[0] : null;
  const singleScope = fixedType !== null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-royal mb-1">
            Church Roster
          </p>
          <h2 className="font-display font-extrabold text-2xl text-ink">Members</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
          {scopes.length > 1 && (
            <div className="flex bg-white border border-ink/15 rounded-full p-1 w-fit">
              {scopes.map((s) => (
                <button
                  key={s}
                  onClick={() => setTab(s)}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                    tab === s ? 'bg-royal text-white' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {TYPE_LABELS[s]}
                </button>
              ))}
            </div>
          )}
          {singleScope && (
            <span className="text-sm font-medium text-ink-soft">{TYPE_LABELS[scopes[0]]} members</span>
          )}
          <Button
            variant="secondary"
            icon={<FileCsv size={16} weight="bold" />}
            onClick={() => setImportOpen(true)}
          >
            Import
          </Button>
          <Button icon={<Plus size={16} weight="bold" />} onClick={openCreate}>
            Add Member
          </Button>
        </div>
      </div>

      <Card padding={false}>
        <Table<Member>
          data={loading ? [] : data}
          emptyMessage={loading ? 'Loading…' : 'No members found'}
          pageSize={10}
          columns={[
            {
              key: 'full_name',
              header: 'Name',
              render: (m) => <span className="font-bold text-ink-black">{m.full_name}</span>,
            },
            {
              key: 'member_type',
              header: 'Type',
              render: (m) => (
                <Badge variant={m.member_type === 'student' ? 'info' : 'accent'}>{TYPE_LABELS[m.member_type]}</Badge>
              ),
            },
            { key: 'phone', header: 'Phone' },
            { key: 'email', header: 'Email', render: (m) => m.email ?? '—' },
            ...(tab === 'student'
              ? [{
                  key: 'level',
                  header: 'Level',
                  render: (m: Member) =>
                    m.level ? <Badge variant="info">{m.level}</Badge> : <span className="text-ink-soft">—</span>,
                }]
              : []),
            {
              key: 'program',
              header: tab === 'student' ? 'Program' : 'Occupation',
              render: (m) =>
                m.member_type === 'student'
                  ? (m.program_of_study ?? '—')
                  : (m.occupation ?? (m.graduation_year ? `Class of ${m.graduation_year}` : '—')),
            },
            { key: 'date_joined', header: 'Joined', render: (m) => formatDate(m.date_joined) },
            {
              key: 'is_active',
              header: 'Status',
              render: (m) => (
                <Badge variant={m.is_active ? 'success' : 'default'} dot>
                  {m.is_active ? 'Active' : 'Inactive'}
                </Badge>
              ),
            },
            {
              key: 'actions',
              header: '',
              className: 'w-24',
              render: (m) => (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(m)}
                    className="p-2 rounded-full text-ink-soft hover:text-royal hover:bg-royal/10 transition-colors"
                    title="Edit"
                  >
                    <PencilSimple size={16} />
                  </button>
                  {canDeleteRow && (
                    <button
                      onClick={() => setDeleting(m)}
                      className="p-2 rounded-full text-ink-soft hover:text-danger hover:bg-danger-bg transition-colors"
                      title="Delete"
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

      <MemberFormModal
        open={modalOpen}
        editing={editing}
        fixedType={fixedType}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={load}
      />

      <ConfirmAlert
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deletingBusy}
        title="Delete member"
        message={`Are you sure you want to delete ${deleting?.full_name ?? 'this member'}? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
