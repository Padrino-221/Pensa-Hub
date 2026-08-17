import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  /** Enable client-side pagination with this many rows per page (default: none). */
  pageSize?: number;
  /** Per-row extra class (e.g. to highlight freshly added rows). */
  rowClassName?: (item: T) => string | undefined;
}

export function Table<T extends { id: string }>({
  columns,
  data,
  emptyMessage = 'No data found',
  onRowClick,
  pageSize,
  rowClassName,
}: TableProps<T>) {
  const [page, setPage] = useState(1);

  const totalPages = pageSize ? Math.max(1, Math.ceil(data.length / pageSize)) : 1;

  // Clamp when data shrinks (e.g. after a delete or filter change).
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const visible = useMemo(() => {
    if (!pageSize) return data;
    const ps = pageSize;
    const start = (page - 1) * ps;
    return data.slice(start, start + ps);
  }, [data, page, pageSize]);

  const start = data.length === 0 ? 0 : (page - 1) * (pageSize ?? 0) + 1;
  const end = Math.min(page * (pageSize ?? 0), data.length);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set<number>([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages));
    return [...pages].sort((a, b) => a - b);
  }, [totalPages, page]);

  return (
    <div className="overflow-x-auto rounded-[18px] border border-ink/15">
      <table className="w-full">
        <thead>
          <tr className="bg-ink/[0.04]">
            {columns.map((col) => (
              <th key={col.key} className={`text-left text-xs font-extrabold text-ink-soft uppercase tracking-wider px-5 py-3 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {visible.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-ink-soft text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            visible.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={`hover:bg-ink/[0.03] transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${rowClassName?.(item) ?? ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-5 py-3.5 text-sm text-ink-black ${col.className || ''}`}>
                    {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pageSize && data.length > pageSize && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-t border-ink/10">
          <p className="text-xs text-ink-soft">
            Showing <span className="font-bold text-ink-black">{start}–{end}</span> of{' '}
            <span className="font-bold text-ink-black">{data.length}</span>
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
            {pageNumbers.map((p, i) => {
              const prev = pageNumbers[i - 1];
              const showGap = prev !== undefined && p - prev > 1;
              return (
                <span key={p} className="flex items-center gap-1">
                  {showGap && <span className="px-1 text-xs text-ink-soft">…</span>}
                  <button
                    onClick={() => setPage(p)}
                    className={`min-w-8 h-8 px-2 rounded-lg text-sm font-bold transition-colors ${
                      p === page ? 'bg-royal text-white' : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
                    }`}
                    aria-label={`Page ${p}`}
                    aria-current={p === page ? 'page' : undefined}
                  >
                    {p}
                  </button>
                </span>
              );
            })}
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
    </div>
  );
}
