import { useRef, useState } from 'react';
import { CloudArrowUp, FilePdf, Trash, UploadSimple } from '@phosphor-icons/react';
import { useToast } from '../../contexts/ToastContext';
import { errMsg } from '../../lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  /** Called after a successful upload with the url and the file size in bytes. */
  onUploaded?: (meta: { url: string; size: number }) => void;
  label?: string;
  hint?: string;
  aspect?: string;
  /** 'image' (default) uploads images; 'file' uploads documents (PDF, Word, PPT, Excel). */
  kind?: 'image' | 'file';
}

const DOCUMENT_ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt';

function fileName(url: string): string {
  try {
    const seg = decodeURIComponent(url.split('?')[0]!.split('/').pop() ?? '');
    return seg || 'Document';
  } catch {
    return 'Document';
  }
}

export function ImageUpload({ value, onChange, onUploaded, label, hint, aspect = 'aspect-video', kind = 'image' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const toast = useToast();

  const isFile = kind === 'file';

  const upload = async (file: File) => {
    if (isFile && file.type.startsWith('image/')) {
      toast.error('Please choose a document file (PDF, Word, PowerPoint, Excel)');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/uploads', {
        method: 'POST',
        credentials: 'include',
        body: form,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.detail || 'Upload failed');
      onChange(body.url);
      onUploaded?.({ url: body.url, size: Number(body.size) || 0 });
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onFile = (file?: File | null) => {
    if (file) upload(file);
  };

  const replaceLabel = isFile ? 'Replace file' : 'Replace image';
  const dropLabel = isFile ? 'Click or drop a document' : 'Click or drop an image';

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-bold text-ink">{label}</span>}

      {value ? (
        <div className="rounded-[12px] border border-ink/20 overflow-hidden">
          {isFile ? (
            <div className="flex items-center gap-3 px-4 py-4 bg-ink/[0.03]">
              <FilePdf size={28} className="text-danger shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink truncate">{fileName(value)}</p>
                <p className="text-xs text-ink-soft truncate">{value}</p>
              </div>
            </div>
          ) : (
            <div className={`w-full ${aspect} bg-ink/[0.03] relative`}>
              <img src={value} alt="" className="w-full h-full object-cover" />
              {uploading && (
                <div className="absolute inset-0 bg-ink/50 grid place-items-center text-white text-sm font-bold">
                  Uploading…
                </div>
              )}
            </div>
          )}
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white border-t border-ink/10">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-royal hover:underline"
            >
              <UploadSimple size={14} /> {replaceLabel}
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-danger hover:underline"
            >
              <Trash size={14} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            onFile(e.dataTransfer.files?.[0]);
          }}
          className={`w-full rounded-[12px] border-2 border-dashed px-4 py-6 flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer ${
            dragOver ? 'border-royal bg-royal/[0.06]' : 'border-ink/25 hover:border-royal/50 hover:bg-royal/[0.03]'
          }`}
        >
          {uploading ? (
            <span className="text-sm font-bold text-ink-soft">Uploading…</span>
          ) : (
            <>
              <CloudArrowUp size={26} className="text-royal" />
              <span className="text-sm font-semibold text-ink">{dropLabel}</span>
              {hint && <span className="text-xs text-ink-soft">{hint}</span>}
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={isFile ? DOCUMENT_ACCEPT : 'image/*'}
        className="hidden"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
        }}
      />
    </div>
  );
}
