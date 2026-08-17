import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarCheck,
  Coins,
  Envelope,
  Lock,
  Users,
  WarningCircle,
} from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { errMsg } from '../lib/utils';

const FEATURES = [
  {
    icon: <Users size={18} weight="fill" />,
    label: 'Members',
    sub: 'Students & alumni in one roster',
  },
  {
    icon: <CalendarCheck size={18} weight="fill" />,
    label: 'Attendance',
    sub: 'Services & Bible study tracking',
  },
  {
    icon: <Coins size={18} weight="fill" />,
    label: 'Finance',
    sub: 'Dues, offerings & tithes ledger',
  },
];

export function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = errMsg(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Brand panel */}
      <div className="hidden lg:flex w-[45%] bg-ink relative flex-col justify-between p-12 overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-ink-3 via-ink to-royal-400/40" />
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] bg-[size:54px_54px]" />
        <div className="absolute -top-40 -left-32 w-[30rem] h-[30rem] bg-royal-400/40 rounded-full blur-[140px] animate-drift" />
        <div className="absolute -bottom-28 -right-24 w-96 h-96 bg-accent-cream/15 rounded-full blur-[120px] animate-drift-slow" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-accent/20 rounded-full blur-[130px]" />

        {/* Brand */}
        <div className="relative flex items-center gap-3">
          <img
            src="/logo.png"
            alt="PU-HUB logo"
            className="w-12 h-12 object-contain shrink-0"
          />
          <div>
            <p className="font-display font-extrabold text-white text-lg leading-tight tracking-wide">PU-HUB</p>
            <p className="text-xs text-white/50">PENSA UENR Hub</p>
          </div>
        </div>

        {/* Pitch */}
        <div className="relative flex-1 flex flex-col justify-center -my-6">
          <p className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.2em] text-accent-cream mb-5">
            <span className="w-7 h-[2px] bg-accent-cream rounded-full" />
            Admin Portal
          </p>
          <h2 className="font-display font-extrabold text-4xl xl:text-[2.6rem] text-white leading-[1.15]">
            Church management for the{' '}
            <span className="text-accent-cream">PENSA UENR</span>{' '}
            community
          </h2>
          <p className="mt-6 text-white/55 text-sm leading-relaxed max-w-md">
            Members, attendance, and finance — in one place. Role-based access for
            admins, the finance secretary, and the IT head.
          </p>

          {/* Feature cards */}
          <div className="mt-10 grid grid-cols-3 gap-3 max-w-lg">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="rounded-[16px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.09] hover:border-white/20 hover:-translate-y-0.5"
              >
                <div className="w-9 h-9 rounded-[12px] bg-accent-cream/15 text-accent-cream flex items-center justify-center mb-3">
                  {f.icon}
                </div>
                <p className="font-display font-bold text-white text-sm">{f.label}</p>
                <p className="text-[11px] text-white/50 mt-0.5 leading-snug">{f.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex items-center justify-between">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} PENSA UENR Hub</p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-accent-cream transition-colors"
          >
            <ArrowLeft size={13} /> Back to website
          </Link>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-[24px] border border-ink/20 p-8 lg:p-10">
            {/* Mobile brand */}
            <div className="lg:hidden flex flex-col items-center gap-3 mb-8">
              <img
                src="/logo.png"
                alt="PU-HUB logo"
                className="w-12 h-12 object-contain"
              />
              <div className="text-center">
                <p className="font-display font-extrabold text-ink text-lg leading-tight">PU-HUB</p>
                <p className="text-xs text-ink-soft">PENSA UENR Hub</p>
              </div>
            </div>

            <div className="text-center lg:text-left">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-royal mb-2">
                Admin Portal
              </p>
              <h1 className="font-display font-extrabold text-3xl text-ink">Welcome back</h1>
              <p className="mt-1.5 mb-8 text-sm text-ink-soft">Sign in to your dashboard</p>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-danger-bg border border-danger/20 text-danger rounded-[12px] px-4 py-3 text-sm mb-5">
                <WarningCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@puhub.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Envelope size={16} />}
                autoComplete="email"
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={16} />}
                autoComplete="current-password"
                required
              />
              <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
                Sign in
              </Button>
            </form>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              to="/"
              className="lg:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-royal transition-colors"
            >
              <ArrowLeft size={13} /> Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
