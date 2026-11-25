import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, KeyRound, Lock, ShieldCheck, X } from 'lucide-react';
import { isPasswordConfigured, verifyOwnerPassword } from '../utils/auth';

interface LoginModalProps {
  open: boolean;
  reason?: string;
  onClose: () => void;
  onSuccess: (password: string) => Promise<void> | void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ open, reason, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  if (!open) return null;

  const configured = isPasswordConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!configured) {
      setError('Owner password secret (OWNER_PASSWORD) is not configured in GitHub Secrets yet.');
      return;
    }
    setChecking(true);
    try {
      const ok = await verifyOwnerPassword(password);
      if (!ok) {
        setError('Incorrect password. Please try again.');
        return;
      }
      await onSuccess(password);
      setPassword('');
      onClose();
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0F1420] p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-300">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Owner Login</h2>
              <p className="text-xs text-slate-400">
                {reason || 'Unlock to view private notes and add or edit content.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!configured && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-950/25 p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-semibold">Password Secret Not Set Yet</p>
              <p className="mt-1 text-amber-200/80">
                In GitHub → Settings → Secrets and variables → Actions, create a repository secret named{' '}
                <code className="font-mono text-white bg-amber-500/20 px-1 py-0.5 rounded">OWNER_PASSWORD</code>{' '}
                and re-run the deploy workflow.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Owner Password
            </label>
            <div className="relative">
              <KeyRound className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPw ? 'text' : 'password'}
                autoFocus
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password..."
                className="w-full rounded-xl border border-slate-700 bg-[#090B10] pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-950/25 px-3 py-2 text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              {error}
            </div>
          )}

          <div className="rounded-xl border border-slate-800 bg-[#090B10] p-3 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Public content and public notes remain readable by everyone. Logging in reveals your encrypted private notes and enables adding/editing notes.
            </span>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={checking}
              className="rounded-xl bg-sky-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50 transition cursor-pointer"
            >
              {checking ? 'Verifying...' : 'Unlock Owner Mode'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
