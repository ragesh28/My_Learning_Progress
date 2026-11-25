import React, { useState } from 'react';
import { CloudDownload, CloudUpload, Download, ExternalLink, Github, Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { GitHubSyncConfig, UserProgressData } from '../types';
import { pullProgressFromGitHub, pushProgressToGitHub, saveGitHubConfig } from '../utils/storage';

interface GitHubSyncModalProps {
  open: boolean;
  config: GitHubSyncConfig;
  progress: UserProgressData;
  onClose: () => void;
  onConfigChange: (cfg: GitHubSyncConfig) => void;
  onImportData: (data: UserProgressData) => void;
  onSyncSuccess: () => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  open,
  config,
  progress,
  onClose,
  onConfigChange,
  onImportData,
  onSyncSuccess,
}) => {
  const [localCfg, setLocalCfg] = useState<GitHubSyncConfig>(config);
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string; url?: string } | null>(null);

  if (!open) return null;

  const persistCfg = (next: GitHubSyncConfig) => {
    setLocalCfg(next);
    saveGitHubConfig(next);
    onConfigChange(next);
  };

  const handlePush = async () => {
    setBusy(true);
    setStatusMsg(null);
    try {
      persistCfg(localCfg);
      const res = await pushProgressToGitHub(localCfg, progress);
      onSyncSuccess();
      setStatusMsg({ type: 'ok', text: res.message, url: res.commitUrl });
    } catch (err) {
      setStatusMsg({ type: 'err', text: err instanceof Error ? err.message : 'Failed to push to GitHub.' });
    } finally {
      setBusy(false);
    }
  };

  const handlePull = async () => {
    setBusy(true);
    setStatusMsg(null);
    try {
      persistCfg(localCfg);
      const data = await pullProgressFromGitHub(localCfg);
      onImportData(data);
      setStatusMsg({ type: 'ok', text: 'Pulled latest notes & progress from GitHub!' });
    } catch (err) {
      setStatusMsg({ type: 'err', text: err instanceof Error ? err.message : 'Failed to pull from GitHub.' });
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-notes.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as UserProgressData;
        onImportData(parsed);
        setStatusMsg({ type: 'ok', text: 'Imported backup JSON into browser storage.' });
      } catch {
        setStatusMsg({ type: 'err', text: 'Invalid JSON file.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#0F1420] p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Save Progress & Notes to GitHub</h2>
              <p className="text-xs text-slate-400">
                Commits <code className="text-sky-300">data/user-notes.json</code> to your private repo.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Owner</label>
            <input
              value={localCfg.owner}
              onChange={(e) => setLocalCfg({ ...localCfg, owner: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-[#090B10] px-3 py-2 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Repository</label>
            <input
              value={localCfg.repo}
              onChange={(e) => setLocalCfg({ ...localCfg, repo: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-[#090B10] px-3 py-2 text-white font-mono"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-slate-400 mb-1">
              GitHub Personal Access Token (stored only in your browser&apos;s localStorage)
            </label>
            <input
              type="password"
              value={localCfg.token}
              onChange={(e) => setLocalCfg({ ...localCfg, token: e.target.value })}
              placeholder="github_pat_..."
              className="w-full rounded-lg border border-slate-700 bg-[#090B10] px-3 py-2 text-white font-mono"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Create a Fine-Grained PAT scoped ONLY to <code>{localCfg.repo}</code> with <strong>Contents: Read and write</strong>.
            </p>
          </div>
        </div>

        {statusMsg && (
          <div
            className={`rounded-xl border p-3 text-xs flex items-start gap-2 ${
              statusMsg.type === 'ok'
                ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/20 text-rose-200'
            }`}
          >
            {statusMsg.type === 'ok' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            )}
            <div className="flex-1">
              <p>{statusMsg.text}</p>
              {statusMsg.url && (
                <a
                  href={statusMsg.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-300 hover:underline mt-1"
                >
                  View Commit <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-2.5 sm:grid-cols-2">
          <button
            disabled={busy}
            onClick={handlePush}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50 transition cursor-pointer"
          >
            <CloudUpload className="h-4 w-4" />
            {busy ? 'Syncing...' : 'Save to GitHub'}
          </button>
          <button
            disabled={busy}
            onClick={handlePull}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50 transition cursor-pointer"
          >
            <CloudDownload className="h-4 w-4" />
            Pull from GitHub
          </button>
        </div>

        <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400">Offline Backup:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#090B10] px-3 py-1.5 text-slate-300 hover:text-white cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Export JSON
            </button>
            <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#090B10] px-3 py-1.5 text-slate-300 hover:text-white cursor-pointer">
              <Upload className="h-3.5 w-3.5" /> Import JSON
              <input type="file" accept="application/json" onChange={handleUploadJson} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
