import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CaretLeft, CaretRight, EnvelopeSimple, Mailbox, TrashSimple } from '@phosphor-icons/react';
import { useToast } from '../contexts/ToastContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ConfirmAlert } from '../components/ui/ConfirmAlert';
import { contact } from '../services/api';
import { errMsg, formatDateTime } from '../lib/utils';
import type { ContactMessage } from '../types';

const PAGE_SIZE = 10;

export function MessagesPage() {
  const toast = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState<ContactMessage | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMessages(await contact.list());
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const open = async (m: ContactMessage) => {
    setSelected(m);
    if (!m.is_read) {
      try {
        const updated = await contact.markRead(m.id);
        setSelected(updated);
        setMessages((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      } catch (e) {
        toast.error(errMsg(e));
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await contact.remove(deleting.id);
      toast.success('Message deleted');
      setMessages((prev) => prev.filter((x) => x.id !== deleting.id));
      if (selected?.id === deleting.id) setSelected(null);
      setDeleting(null);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setDeletingBusy(false);
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const totalPages = Math.max(1, Math.ceil(messages.length / PAGE_SIZE));
  const pagedMessages = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return messages.slice(start, start + PAGE_SIZE);
  }, [messages, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageStart = messages.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(page * PAGE_SIZE, messages.length);

  // ---- Detail view ----
  if (selected) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-2 text-sm font-bold text-ink-soft hover:text-ink transition-colors w-fit"
          >
            <ArrowLeft size={16} /> All messages
          </button>
          <Button
            variant="danger"
            size="sm"
            icon={<TrashSimple size={14} weight="bold" />}
            onClick={() => setDeleting(selected)}
            className="sm:ml-auto"
          >
            Delete
          </Button>
        </div>

        <Card className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={selected.is_read ? 'info' : 'warning'}>
              {selected.is_read ? 'Read' : 'Unread'}
            </Badge>
            <span className="text-sm text-ink-soft">{formatDateTime(selected.created_at)}</span>
          </div>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-ink">{selected.subject}</h2>
            <p className="text-sm text-ink-soft mt-1">
              From <span className="font-bold text-ink">{selected.name}</span>{' '}
              <a href={`mailto:${selected.email}`} className="font-semibold text-royal hover:underline">
                {selected.email}
              </a>
            </p>
          </div>
          <div className="border-t border-ink/10 pt-4">
            <p className="whitespace-pre-wrap leading-relaxed text-ink">{selected.message}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              icon={<EnvelopeSimple size={16} />}
              onClick={() => window.location.assign(`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`)}
            >
              Reply by email
            </Button>
          </div>
        </Card>

        <ConfirmAlert
          open={deleting !== null}
          onClose={() => setDeleting(null)}
          onConfirm={confirmDelete}
          loading={deletingBusy}
          title="Delete message"
          message={`Delete the message "${deleting?.subject ?? ''}" from ${deleting?.name ?? ''}? This cannot be undone.`}
          confirmLabel="Delete"
        />
      </div>
    );
  }

  // ---- Inbox list ----
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-[14px] bg-ink/[0.07] text-ink flex items-center justify-center">
          <Mailbox size={22} />
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-royal mb-1">
            Website Inbox
          </p>
          <h2 className="font-display font-extrabold text-2xl text-ink">Messages</h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Messages sent through the Contact page on the website.
            {unreadCount > 0 && (
              <span className="font-bold text-royal"> {unreadCount} unread.</span>
            )}
          </p>
        </div>
      </div>

      <Card padding={false}>
        {loading ? (
          <div className="p-6 text-sm text-ink-soft">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14 px-6">
            <div className="w-14 h-14 rounded-[16px] bg-royal/10 text-royal flex items-center justify-center mb-4">
              <EnvelopeSimple size={28} weight="duotone" />
            </div>
            <h3 className="font-display font-extrabold text-ink text-lg">No messages yet</h3>
            <p className="text-sm text-ink-soft max-w-xs mt-1">
              Messages submitted through the Contact page will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {pagedMessages.map((m) => (
              <li key={m.id} className="flex items-start gap-4 px-6 py-4 group">
                <button
                  onClick={() => open(m)}
                  className="flex items-start gap-4 min-w-0 flex-1 text-left cursor-pointer"
                >
                  <span
                    className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                      m.is_read ? 'bg-ink/20' : 'bg-royal'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-bold text-ink-black">{m.name}</span>
                      <span className="text-xs text-ink-soft">{formatDateTime(m.created_at)}</span>
                    </span>
                    <span className={`block truncate text-sm ${m.is_read ? 'text-ink-soft' : 'font-semibold text-ink-black'}`}>
                      {m.subject}
                    </span>
                    <span className="block truncate text-sm text-ink-soft">{m.message}</span>
                  </span>
                </button>
                <button
                  onClick={() => setDeleting(m)}
                  className="p-2 rounded-full text-ink-soft hover:text-danger hover:bg-danger-bg transition-colors shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete message"
                >
                  <TrashSimple size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {messages.length > PAGE_SIZE && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-1">
          <p className="text-xs text-ink-soft">
            Showing <span className="font-bold text-ink-black">{pageStart}–{pageEnd}</span> of{' '}
            <span className="font-bold text-ink-black">{messages.length}</span>
          </p>
          <div className="flex items-center gap-1 sm:ml-auto">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <CaretLeft size={16} />
            </button>
            <span className="text-sm font-bold text-ink-black px-2">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <CaretRight size={16} />
            </button>
          </div>
        </div>
      )}

      <ConfirmAlert
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deletingBusy}
        title="Delete message"
        message={`Delete the message "${deleting?.subject ?? ''}" from ${deleting?.name ?? ''}? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
