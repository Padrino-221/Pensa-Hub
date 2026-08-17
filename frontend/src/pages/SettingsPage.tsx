import { useState } from 'react';
import {
  ArrowRight,
  GraduationCap,
  SquaresFour,
  Sparkle,
  TrendUp,
  UsersThree,
  CheckCircle,
} from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { canManageSettings } from '../lib/permissions';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ConfirmAlert } from '../components/ui/ConfirmAlert';
import { SiteBuilder } from '../components/settings/SiteBuilder';
import { members } from '../services/api';
import { errMsg } from '../lib/utils';

export function SettingsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [promptPromote, setPromptPromote] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [result, setResult] = useState<{ promoted: number; graduated: number } | null>(null);

  if (!user || !canManageSettings(user.role)) return null;

  const runPromotion = async () => {
    setPromoting(true);
    try {
      const res = await members.promote();
      setResult(res);
      toast.success(`${res.promoted} student${res.promoted === 1 ? '' : 's'} promoted, ${res.graduated} graduated`);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setPromoting(false);
      setPromptPromote(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-royal mb-1">Website Builder</p>
        <h2 className="font-display font-extrabold text-2xl text-ink">Settings</h2>
        <p className="text-sm text-ink-soft mt-0.5">
          Edit every page, section, and design token of the website in a full-screen sandbox, and manage student promotions.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[14px] bg-royal/10 text-royal flex items-center justify-center">
              <SquaresFour size={22} weight="bold" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-ink">Open the Site Builder</h3>
              <p className="text-sm text-ink-soft">
                Edit content, branding, fonts, colors, styles, motion, and navigation — with a live preview of the website.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Live preview', 'Undo / redo', 'Save & Publish', 'Device previews'].map((f) => (
              <span key={f} className="text-xs font-bold bg-ink/[0.05] text-ink-soft rounded-full px-3 py-1">
                {f}
              </span>
            ))}
          </div>
          <Button onClick={() => setOpen(true)} icon={<Sparkle size={16} weight="bold" />} className="self-start">
            Open Site Builder <ArrowRight size={16} />
          </Button>
        </Card>

        <Card className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[14px] bg-success-bg text-success flex items-center justify-center">
              <GraduationCap size={22} weight="bold" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-ink">Promote Students</h3>
              <p className="text-sm text-ink-soft">
                Move every active student up one level (100 → 200 → 300 → 400). Students at level 400 graduate to alumni.
              </p>
            </div>
          </div>

          {result && (
            <div className="rounded-[14px] border border-success/25 bg-success-bg p-4">
              <div className="flex items-center gap-2.5 mb-2">
                <CheckCircle size={18} weight="bold" className="text-success" />
                <p className="font-display font-extrabold text-ink">Promotion complete</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="rounded-[12px] bg-white border border-ink/10 p-3">
                  <p className="text-xs font-bold text-ink-soft uppercase tracking-wide">Moved up</p>
                  <p className="font-display font-extrabold text-2xl text-ink mt-0.5">{result.promoted}</p>
                </div>
                <div className="rounded-[12px] bg-white border border-ink/10 p-3">
                  <p className="text-xs font-bold text-ink-soft uppercase tracking-wide">Graduated to alumni</p>
                  <p className="font-display font-extrabold text-2xl text-ink mt-0.5">{result.graduated}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-ink/[0.05] text-ink-soft rounded-full px-3 py-1">
                <TrendUp size={13} /> 100 → 200 → 300 → 400
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-ink/[0.05] text-ink-soft rounded-full px-3 py-1">
                <UsersThree size={13} /> 400 → Alumni
              </span>
            </div>
            <Button
              icon={<GraduationCap size={16} weight="bold" />}
              onClick={() => setPromptPromote(true)}
              className="self-start"
            >
              Promote students one level
            </Button>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-display font-extrabold text-ink mb-3">How it works</h3>
        <ul className="space-y-2.5 text-sm text-ink-soft">
          <li className="flex gap-2"><span className="text-royal font-bold">1.</span> Pick a page or design area from the right-side rail.</li>
          <li className="flex gap-2"><span className="text-royal font-bold">2.</span> Edit any section — the canvas preview updates instantly.</li>
          <li className="flex gap-2"><span className="text-royal font-bold">3.</span> Saving is mandatory before leaving; changes publish to the live website.</li>
          <li className="flex gap-2"><span className="text-royal font-bold">4.</span> Use <span className="font-semibold text-ink">Promote Students</span> once per academic year to advance the roster.</li>
        </ul>
      </Card>

      {open && <SiteBuilder onClose={() => setOpen(false)} />}

      <ConfirmAlert
        open={promptPromote}
        onClose={() => setPromptPromote(false)}
        onConfirm={runPromotion}
        loading={promoting}
        variant="warning"
        title="Promote all students?"
        message="Every active student moves up one level. Students at level 400 will graduate to alumni status. This cannot be undone automatically — continue?"
        confirmLabel="Promote"
      />
    </div>
  );
}
