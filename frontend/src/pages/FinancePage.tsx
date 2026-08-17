import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { PencilSimple, Plus, TrashSimple, TrendDown, TrendUp, PiggyBank } from '@phosphor-icons/react';
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
import { finance, members } from '../services/api';
import { canManageFinance } from '../lib/permissions';
import { errMsg, formatDate, formatDateTime, formatMoney, todayISO } from '../lib/utils';
import type { FinancialSummary, Member, Transaction, TransactionType } from '../types';

const TYPE_LABELS: Record<TransactionType, string> = {
  tithe: 'Tithe',
  offering: 'Offering',
  dues: 'Dues',
  expense: 'Expense',
};

const TYPE_VARIANTS: Record<TransactionType, 'success' | 'info' | 'warning' | 'danger'> = {
  tithe: 'success',
  offering: 'info',
  dues: 'warning',
  expense: 'danger',
};

const TYPE_OPTIONS = (Object.keys(TYPE_LABELS) as TransactionType[]).map((t) => ({
  value: t,
  label: TYPE_LABELS[t],
}));

function TransactionFormModal({ open, editing, onClose, onSaved }: {
  open: boolean;
  editing: Transaction | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [type, setType] = useState<TransactionType>('offering');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState('');
  const [memberId, setMemberId] = useState('');

  useEffect(() => {
    if (!open) return;
    members.list()
      .then(setMembersList)
      .catch(() => setMembersList([]));
    if (editing) {
      setType(editing.type);
      setAmount(editing.amount);
      setDate(editing.transaction_date);
      setDescription(editing.description ?? '');
      setMemberId(editing.member_id ?? '');
    } else {
      setType('offering');
      setAmount('');
      setDate(todayISO());
      setDescription('');
      setMemberId('');
    }
  }, [open, editing]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        type,
        amount: value,
        transaction_date: date,
        description: description.trim() || null,
        member_id: memberId || null,
      };
      if (editing) {
        await finance.updateTransaction(editing.id, payload);
        toast.success('Transaction updated');
      } else {
        await finance.createTransaction(payload);
        toast.success('Transaction recorded');
      }
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
      title={editing ? 'Edit Transaction' : 'Record Transaction'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="tx-form" loading={saving}>
            {editing ? 'Save changes' : 'Record'}
          </Button>
        </>
      }
    >
      <form id="tx-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Type"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
        />
        <Input
          label="Amount (GH₵)"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <DatePicker label="Date" value={date} onChange={setDate} />
        <Select
          label="Member (optional)"
          options={membersList.map((m) => ({
            value: m.id,
            label: `${m.full_name} (${m.member_type === 'student' ? 'Student' : 'Alumni'})`,
          }))}
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          placeholder="General / non-member"
        />
        <div className="sm:col-span-2">
          <label className="text-sm font-bold text-ink">Description (optional)</label>
          <textarea
            className="w-full mt-1.5 bg-white border border-ink/20 rounded-[12px] px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal min-h-20"
            placeholder="e.g. Sunday offering collection"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}

export function FinancePage() {
  const { user } = useAuth();
  const toast = useToast();
  const role = user!.role;
  const canEdit = canManageFinance(role);

  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [membersMap, setMembersMap] = useState<Map<string, Member>>(new Map());
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [txs, sum, mems] = await Promise.all([
        finance.listTransactions(filter ? (filter as TransactionType) : undefined),
        finance.summary(),
        members.list(),
      ]);
      setTransactions(txs);
      setSummary(sum);
      setMembersMap(new Map(mems.map((m) => [m.id, m])));
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => { load(); }, [load]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await finance.removeTransaction(deleting.id);
      toast.success('Transaction deleted');
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
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-royal mb-1">
            Church Ledger
          </p>
          <h2 className="font-display font-extrabold text-2xl text-ink">Finance</h2>
          <p className="text-sm text-ink-soft mt-0.5">
            {canEdit ? 'Record and manage the church ledger.' : 'View-only access to financial records.'}
          </p>
        </div>
        {canEdit && (
          <Button
            icon={<Plus size={16} weight="bold" />}
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="sm:ml-auto"
          >
            Record Transaction
          </Button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-[14px] bg-success-bg text-success flex items-center justify-center shrink-0">
            <TrendUp size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wide">Total Income</p>
            <p className="font-display font-extrabold text-2xl text-ink">{formatMoney(summary?.total_income)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-[14px] bg-danger-bg text-danger flex items-center justify-center shrink-0">
            <TrendDown size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wide">Total Expenses</p>
            <p className="font-display font-extrabold text-2xl text-ink">{formatMoney(summary?.total_expenses)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-[14px] bg-ink/[0.07] text-ink flex items-center justify-center shrink-0">
            <PiggyBank size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wide">Balance</p>
            <p className={`font-display font-extrabold text-2xl ${(summary?.balance ?? 0) >= 0 ? 'text-ink' : 'text-danger'}`}>
              {formatMoney(summary?.balance)}
            </p>
          </div>
        </Card>
      </div>

      {/* Ledger */}
      <Card padding={false}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 pt-5 pb-4">
          <h3 className="font-display font-extrabold text-ink">Transactions</h3>
          <div className="sm:ml-auto w-full sm:w-48">
            <Select
              options={[{ value: '', label: 'All types' }, ...TYPE_OPTIONS]}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
        <Table<Transaction>
          data={loading ? [] : transactions}
          emptyMessage={loading ? 'Loading…' : 'No transactions recorded yet.'}
          pageSize={10}
          columns={[
            { key: 'transaction_date', header: 'Date', render: (t) => <span className="font-bold text-ink-black">{formatDate(t.transaction_date)}</span> },
            { key: 'type', header: 'Type', render: (t) => <Badge variant={TYPE_VARIANTS[t.type]}>{TYPE_LABELS[t.type]}</Badge> },
            {
              key: 'member',
              header: 'Member',
              render: (t) => (t.member_id ? (membersMap.get(t.member_id)?.full_name ?? '—') : 'General'),
            },
            { key: 'description', header: 'Description', render: (t) => t.description ?? '—' },
            {
              key: 'amount',
              header: 'Amount',
              render: (t) => (
                <span className={`font-semibold ${t.type === 'expense' ? 'text-danger' : 'text-success'}`}>
                  {t.type === 'expense' ? '−' : '+'}{formatMoney(t.amount)}
                </span>
              ),
            },
            { key: 'created_at', header: 'Recorded', render: (t) => formatDateTime(t.created_at) },
            ...(canEdit
              ? [{
                  key: 'actions' as string,
                  header: '',
                  className: 'w-24',
                  render: (t: Transaction) => (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditing(t); setModalOpen(true); }}
                        className="p-2 rounded-full text-ink-soft hover:text-royal hover:bg-royal/10 transition-colors"
                        title="Edit"
                      >
                        <PencilSimple size={16} />
                      </button>
                      <button
                        onClick={() => setDeleting(t)}
                        className="p-2 rounded-full text-ink-soft hover:text-danger hover:bg-danger-bg transition-colors"
                        title="Delete"
                      >
                        <TrashSimple size={16} />
                      </button>
                    </div>
                  ),
                }]
              : []),
          ]}
        />
      </Card>

      <TransactionFormModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />

      <ConfirmAlert
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deletingBusy}
        title="Delete transaction"
        message={`Delete the ${deleting ? TYPE_LABELS[deleting.type] : ''} of ${deleting ? formatMoney(deleting.amount) : ''}? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
