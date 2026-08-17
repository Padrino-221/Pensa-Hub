import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { PencilSimple, Plus, TrashSimple, UserGear } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { ConfirmAlert } from '../components/ui/ConfirmAlert';
import { Table } from '../components/ui/Table';
import { users } from '../services/api';
import { errMsg } from '../lib/utils';
import { ROLE_COLORS, ROLE_LABELS } from '../types';
import type { Role, User } from '../types';

const ROLE_OPTIONS = (Object.keys(ROLE_LABELS) as Role[]).map((r) => ({
  value: r,
  label: ROLE_LABELS[r],
}));

function EditUserModal({ user, open, onClose, onSaved }: {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('admin_student');
  const [active, setActive] = useState(true);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!user || !open) return;
    setFullName(user.full_name);
    setPhone(user.phone);
    setRole(user.role);
    setActive(user.is_active);
    setPassword('');
  }, [user, open]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!fullName.trim() || !phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    if (password && password.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await users.update(user.id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        role,
        is_active: active,
        password: password || undefined,
      });
      toast.success('Account updated');
      onClose();
      onSaved();
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
      title="Edit Account"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="edit-user-form" loading={saving}>Save changes</Button>
        </>
      }
    >
      <form id="edit-user-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input label="Full name" placeholder="e.g. Ama Serwaa" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <Input label="Phone" placeholder="e.g. 024 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <Select
          label="Role"
          options={ROLE_OPTIONS}
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        />
        <div className="sm:col-span-2 flex items-center justify-between gap-3 rounded-[12px] bg-ink/[0.03] border border-ink/10 px-4 py-3">
          <div>
            <p className="text-sm font-bold text-ink">Active account</p>
            <p className="text-xs text-ink-soft">Inactive users cannot sign in and lose access immediately.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={active}
            onClick={() => setActive(!active)}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${active ? 'bg-royal' : 'bg-ink/20'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${active ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>
        <div className="sm:col-span-2">
          <Input
            label="New password (optional)"
            type="password"
            placeholder="Leave blank to keep current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}

function CreateUserModal({ open, onClose, onCreated }: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('admin_student');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || password.length < 6) {
      toast.error('Fill all fields (password must be at least 6 characters)');
      return;
    }
    setSaving(true);
    try {
      await users.create({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
      });
      toast.success('Account created');
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
      title="Create Admin Account"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="user-form" loading={saving}>Create account</Button>
        </>
      }
    >
      <form id="user-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input label="Full name" placeholder="e.g. Ama Serwaa" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <Input label="Email" type="email" placeholder="name@puhub.org" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Phone" placeholder="e.g. 024 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <Input label="Password" type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Select
          label="Role"
          options={ROLE_OPTIONS}
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        />
      </form>
    </Modal>
  );
}

export function UsersPage() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await users.list());
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await users.remove(deleting.id);
      toast.success('Account deleted');
      setDeleting(null);
      await load();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setDeletingBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[14px] bg-royal/10 text-royal flex items-center justify-center">
            <UserGear size={22} />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-royal mb-1">
              Access Control
            </p>
            <h2 className="font-display font-extrabold text-2xl text-ink">User Management</h2>
            <p className="text-sm text-ink-soft mt-0.5">
              Create and manage admin accounts. Super Admin only.
            </p>
          </div>
        </div>
        <Button icon={<Plus size={16} weight="bold" />} onClick={() => setModalOpen(true)} className="sm:ml-auto">
          Create Account
        </Button>
      </div>

      <Card padding={false}>
        <Table<User>
          data={loading ? [] : data}
          emptyMessage={loading ? 'Loading…' : 'No accounts found.'}
          pageSize={10}
          columns={[
            { key: 'full_name', header: 'Name', render: (u) => <span className="font-bold text-ink-black">{u.full_name}</span> },
            { key: 'email', header: 'Email' },
            { key: 'phone', header: 'Phone' },
            {
              key: 'role',
              header: 'Role',
              render: (u) => <Badge className={ROLE_COLORS[u.role]}>{ROLE_LABELS[u.role]}</Badge>,
            },
            {
              key: 'created_by',
              header: 'Created By',
              render: (u) => (u.created_by ? data.find((d) => d.id === u.created_by)?.full_name ?? u.created_by.slice(0, 8) : '—'),
            },
            {
              key: 'is_active',
              header: 'Status',
              render: (u) => (
                <Badge variant={u.is_active ? 'success' : 'danger'} dot>
                  {u.is_active ? 'Active' : 'Inactive'}
                </Badge>
              ),
            },
            {
              key: 'actions',
              header: '',
              className: 'w-24',
              render: (u) =>
                u.id !== me?.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditing(u)}
                      className="p-2 rounded-full text-ink-soft hover:text-royal hover:bg-royal/10 transition-colors"
                      title="Edit account"
                    >
                      <PencilSimple size={16} />
                    </button>
                    <button
                      onClick={() => setDeleting(u)}
                      className="p-2 rounded-full text-ink-soft hover:text-danger hover:bg-danger-bg transition-colors"
                      title="Delete account"
                    >
                      <TrashSimple size={16} />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-ink-soft px-2">You</span>
                ),
            },
          ]}
        />
      </Card>

      <CreateUserModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={load} />

      <EditUserModal user={editing} open={editing !== null} onClose={() => setEditing(null)} onSaved={load} />

      <ConfirmAlert
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deletingBusy}
        title="Delete account"
        message={`Delete the account for ${deleting?.full_name ?? 'this user'}? They will lose access immediately.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
