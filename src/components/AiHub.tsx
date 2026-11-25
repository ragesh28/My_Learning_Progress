import React, { useMemo, useState } from 'react';
import { BookMarked, ExternalLink, FileText, Plus, Search, Sparkles, Tag, Trash2, Edit3 } from 'lucide-react';
import { AiEntry } from '../types';

interface AiHubProps {
  entries: AiEntry[];
  onAddOrUpdate: (entry: AiEntry) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES: AiEntry['category'][] = [
  'Paper',
  'LLMs',
  'Agents',
  'RAG',
  'ML Foundations',
  'Tool / Repo',
  'Note',
];

const STATUSES: AiEntry['status'][] = ['To Read', 'Reading', 'Mastered'];

export const AiHub: React.FC<AiHubProps> = ({ entries, onAddOrUpdate, onDelete }) => {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<'All' | AiEntry['category']>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | AiEntry['status']>('All');
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AiEntry['category']>('Paper');
  const [status, setStatus] = useState<AiEntry['status']>('Reading');
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [tagsRaw, setTagsRaw] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Paper');
    setStatus('Reading');
    setUrl('');
    setSummary('');
    setTagsRaw('');
    setShowForm(false);
  };

  const handleEdit = (entry: AiEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setCategory(entry.category);
    setStatus(entry.status);
    setUrl(entry.url || '');
    setSummary(entry.summary);
    setTagsRaw(entry.tags.join(', '));
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const now = new Date().toISOString();
    const existing = editingId ? entries.find((item) => item.id === editingId) : undefined;
    const entry: AiEntry = {
      id: editingId || `ai-${Date.now()}`,
      title: title.trim(),
      category,
      status,
      url: url.trim() || undefined,
      summary: summary.trim(),
      tags: tagsRaw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    onAddOrUpdate(entry);
    resetForm();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((item) => {
      const catOk = catFilter === 'All' || item.category === catFilter;
      const statusOk = statusFilter === 'All' || item.status === statusFilter;
      const queryOk =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));
      return catOk && statusOk && queryOk;
    });
  }, [entries, search, catFilter, statusFilter]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <section className="rounded-2xl border border-slate-800 bg-gradient-to-r from-[#111626] via-[#0E121B] to-[#0D1622] p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-300 mb-1">
            <Sparkles className="h-4 w-4" />
            PERSONAL AI KNOWLEDGE BASE
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Notes & Research Papers</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Manually capture AI papers, arXiv links, LLM architectures, agent patterns, and personal takeaways. Click <strong className="text-sky-300">Save to GitHub</strong> in the top bar anytime to sync to your private repo.
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Close Form' : 'Add AI Note / Paper'}
        </button>
      </section>

      {/* Add / Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-indigo-500/35 bg-[#0E121B] p-6 space-y-4 shadow-xl"
        >
          <h2 className="text-base font-bold text-white">
            {editingId ? 'Edit AI Entry' : 'New AI Note / Paper'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Title *</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Attention Is All You Need / ReAct Agents Notes"
                className="w-full rounded-xl border border-slate-700 bg-[#090B10] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AiEntry['category'])}
                className="w-full rounded-xl border border-slate-700 bg-[#090B10] px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AiEntry['status'])}
                className="w-full rounded-xl border border-slate-700 bg-[#090B10] px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Paper / Resource URL</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://arxiv.org/abs/..."
                className="w-full rounded-xl border border-slate-700 bg-[#090B10] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tags (comma separated)</label>
              <input
                value={tagsRaw}
                onChange={(e) => setTagsRaw(e.target.value)}
                placeholder="transformers, attention, rag, fine-tuning"
                className="w-full rounded-xl border border-slate-700 bg-[#090B10] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Your Notes & Key Takeaways</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                placeholder="Write what you learned, core ideas, equations, or implementation notes..."
                className="w-full rounded-xl border border-slate-700 bg-[#090B10] p-3.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-500 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-400 cursor-pointer"
            >
              {editingId ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search AI notes, papers, or tags..."
            className="w-full rounded-xl border border-slate-700 bg-[#0E121B] pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value as 'All' | AiEntry['category'])}
          className="rounded-xl border border-slate-700 bg-[#0E121B] px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'All' | AiEntry['status'])}
          className="rounded-xl border border-slate-700 bg-[#0E121B] px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
        >
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Entries Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-[#0E121B]/60 p-12 text-center">
          <BookMarked className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No AI notes or papers yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Click &ldquo;Add AI Note / Paper&rdquo; above to start building your personal AI research library with paper links, tags, and summaries.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((entry) => (
            <article
              key={entry.id}
              className="rounded-2xl border border-slate-800 bg-[#0E121B] p-5 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[11px] font-mono text-indigo-300">
                      {entry.category}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-mono border ${
                        entry.status === 'Mastered'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : entry.status === 'Reading'
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(entry.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="mt-3 text-base font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                  {entry.title}
                </h3>

                {entry.summary && (
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {entry.summary}
                  </p>
                )}

                {entry.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-[#090B10] px-2 py-0.5 text-[11px] text-slate-400"
                      >
                        <Tag className="h-2.5 w-2.5 text-slate-500" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-slate-500">
                  Updated {new Date(entry.updatedAt).toLocaleDateString()}
                </span>
                {entry.url && (
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium"
                  >
                    Open Paper / Link
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
