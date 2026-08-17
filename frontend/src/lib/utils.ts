/** Extract a readable error message from an unknown thrown value. */
export function errMsg(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  return 'Something went wrong';
}

/** Format an ISO date string (yyyy-mm-dd) for display. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value + 'T00:00:00').toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format a datetime ISO string for display. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Format a numeric amount as GHS currency. */
export function formatMoney(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
  return `GH₵ ${Number.isFinite(n) ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}`;
}

/** Initials from a full name, e.g. "Kwame Mensah" -> "KM". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

/** Format a byte count as a human-readable file size, e.g. 2516582 -> "2.4 MB". */
export function formatBytes(bytes: number | null | undefined): string {
  const n = typeof bytes === 'number' && Number.isFinite(bytes) ? bytes : 0;
  if (n <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = n;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = unit === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[unit]}`;
}

/** Today's date as yyyy-mm-dd (local). */
export function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
