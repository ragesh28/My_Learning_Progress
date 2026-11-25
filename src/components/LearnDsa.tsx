import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  Minus,
  Plus,
  RotateCcw,
  Search,
  StickyNote,
  Target,
} from 'lucide-react';
import {
  DP_LEARNING_ORDER,
  IMMEDIATE_CHECKLIST,
  MASTERY_STEPS,
  PATTERN_RECOGNITION,
  PERSONAL_START_PATH,
  PRACTICE_PLAN,
  ROADMAP_PHASES,
} from '../data/dsaRoadmap';
import { TopicNote, UserProgressData } from '../types';

interface LearnDsaProps {
  progress: UserProgressData;
  onToggleTopic: (topicId: string) => void;
  onToggleChecklist: (chkId: string) => void;
  onResetChecklist: () => void;
  onUpdatePractice: (groupId: string, delta: number, max: number) => void;
  onSaveNote: (note: TopicNote) => void;
}

type LearnSubTab = 'roadmap' | 'checklist' | 'patterns' | 'practice';

export const LearnDsa: React.FC<LearnDsaProps> = ({
  progress,
  onToggleTopic,
  onToggleChecklist,
  onResetChecklist,
  onUpdatePractice,
  onSaveNote,
}) => {
  const [subTab, setSubTab] = useState<LearnSubTab>('roadmap');
  const [openPhases, setOpenPhases] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: false, 4: false, 5: false, 6: false });
  const [patternQuery, setPatternQuery] = useState('');
  const [patternCat, setPatternCat] = useState<string>('All');
  const [editingNoteTopic, setEditingNoteTopic] = useState<{ id: string; title: string } | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const totalTopics = useMemo(
    () => ROADMAP_PHASES.reduce((acc, p) => acc + p.topics.length, 0),
    []
  );
  const completedCount = progress.completedTopics.length;
  const checklistCount = progress.completedChecklist.length;
  const totalPracticeSolved = useMemo(
    () => Object.values(progress.practiceSolved).reduce((acc, n) => acc + n, 0),
    [progress.practiceSolved]
  );

  const filteredPatterns = useMemo(() => {
    return PATTERN_RECOGNITION.filter((row) => {
      const matchesCat = patternCat === 'All' || row.category === patternCat;
      const q = patternQuery.trim().toLowerCase();
      const matchesQuery =
        !q || row.clue.toLowerCase().includes(q) || row.technique.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [patternCat, patternQuery]);

  const openNoteEditor = (id: string, title: string) => {
    setEditingNoteTopic({ id, title });
    setNoteDraft(progress.topicNotes[id]?.content || '');
  };

  const handleSaveInlineNote = () => {
    if (!editingNoteTopic) return;
    onSaveNote({
      topicId: editingNoteTopic.id,
      topicName: editingNoteTopic.title,
      content: noteDraft.trim(),
      links: progress.topicNotes[editingNoteTopic.id]?.links || [],
      updatedAt: new Date().toISOString(),
    });
    setEditingNoteTopic(null);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Progress Overview Header */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-[#0E121B] p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400">6-Phase Roadmap</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-sky-400">
              {completedCount}/{totalTopics}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {Math.round((completedCount / totalTopics) * 100)}%
            </span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${(completedCount / totalTopics) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0E121B] p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Immediate Checklist</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {checklistCount}/{IMMEDIATE_CHECKLIST.length}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {Math.round((checklistCount / IMMEDIATE_CHECKLIST.length) * 100)}%
            </span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(checklistCount / IMMEDIATE_CHECKLIST.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0E121B] p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400">150-Problem Practice</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-amber-400">
              {totalPracticeSolved}/150
            </span>
            <span className="text-xs font-mono text-slate-400">
              {Math.round((totalPracticeSolved / 150) * 100)}%
            </span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${Math.min((totalPracticeSolved / 150) * 100, 100)}%` }}
            />
          </div>
        </div>
      </section>

      {/* Sub-Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        {[
          { id: 'roadmap', label: '6-Phase Roadmap (57 Topics)', icon: BookOpen },
          { id: 'checklist', label: 'Immediate 13-Step & DP Order', icon: CheckCircle2 },
          { id: 'patterns', label: 'Pattern Recognition Table', icon: Compass },
          { id: 'practice', label: '150-Problem Plan & Mastery', icon: Target },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as LearnSubTab)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                active
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40'
                  : 'bg-[#0E121B] text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: 6-Phase Roadmap */}
      {subTab === 'roadmap' && (
        <div className="space-y-4">
          {ROADMAP_PHASES.map((phase) => {
            const isOpen = !!openPhases[phase.phase];
            const phaseDone = phase.topics.filter((t) => progress.completedTopics.includes(t.id)).length;
            return (
              <div
                key={phase.phase}
                className="rounded-2xl border border-slate-800 bg-[#0E121B] overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenPhases((prev) => ({ ...prev, [phase.phase]: !prev[phase.phase] }))
                  }
                  className="w-full px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-left hover:bg-slate-800/30 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {isOpen ? (
                      <ChevronDown className="h-5 w-5 text-sky-400 shrink-0" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-500 shrink-0" />
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-white">{phase.title}</h3>
                        <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-mono text-sky-300">
                          {phase.level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{phase.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-emerald-400">
                      {phaseDone}/{phase.topics.length} done
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-800/80 p-4 sm:p-5 space-y-3 bg-[#0A0D14]">
                    {phase.pythonNote && (
                      <div className="rounded-xl border border-sky-500/20 bg-sky-950/15 px-4 py-2.5 text-xs text-sky-200/90">
                        <strong className="text-sky-300">Tip:</strong> {phase.pythonNote}
                      </div>
                    )}

                    <div className="grid gap-2.5">
                      {phase.topics.map((topic) => {
                        const checked = progress.completedTopics.includes(topic.id);
                        const hasNote = Boolean(progress.topicNotes[topic.id]?.content);
                        return (
                          <div
                            key={topic.id}
                            className={`rounded-xl border p-3.5 flex flex-wrap items-start justify-between gap-3 transition ${
                              checked
                                ? 'border-emerald-500/35 bg-emerald-950/15'
                                : 'border-slate-800/90 bg-[#0E121B] hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => onToggleTopic(topic.id)}
                                aria-label={`Toggle ${topic.title}`}
                                className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition cursor-pointer ${
                                  checked
                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                    : 'border-slate-600 bg-slate-900 hover:border-sky-400'
                                }`}
                              >
                                {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                              </button>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-xs text-slate-500">
                                    #{topic.order.toString().padStart(2, '0')}
                                  </span>
                                  <span
                                    className={`text-sm font-semibold ${
                                      checked ? 'line-through text-slate-400' : 'text-white'
                                    }`}
                                  >
                                    {topic.title}
                                  </span>
                                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                                    {topic.category}
                                  </span>
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                  {topic.concepts.map((c) => (
                                    <span
                                      key={c}
                                      className="rounded-md border border-slate-800 bg-[#090B10] px-2 py-0.5 text-[11px] text-slate-400"
                                    >
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => openNoteEditor(topic.id, topic.title)}
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                                hasNote
                                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                                  : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-white'
                              }`}
                            >
                              <StickyNote className="h-3.5 w-3.5" />
                              {hasNote ? 'Edit Note' : 'Add Note'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Immediate 13-Step Checklist & DP Order */}
      {subTab === 'checklist' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#0E121B] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Immediate Learning Checklist</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  You can start Two Pointers as soon as you know array indexing, traversal, sorting basics, and Big-O.
                </p>
              </div>
              <button
                onClick={onResetChecklist}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset progress
              </button>
            </div>

            <div className="space-y-2.5">
              {IMMEDIATE_CHECKLIST.map((item) => {
                const done = progress.completedChecklist.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => onToggleChecklist(item.id)}
                    className={`w-full text-left rounded-xl border p-3.5 flex items-center gap-3.5 transition cursor-pointer ${
                      done
                        ? 'border-emerald-500/40 bg-emerald-950/15'
                        : 'border-slate-800 bg-[#090B10] hover:border-slate-700'
                    }`}
                  >
                    <span
                      className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 ${
                        done
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-600'
                      }`}
                    >
                      {done && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${done ? 'line-through text-slate-400' : 'text-white'}`}>
                        {item.order}. {item.title}
                      </p>
                      <p className="text-xs text-slate-400">{item.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-sky-500/25 bg-[#0E121B] p-5">
              <h3 className="text-base font-bold text-white mb-1">Your Personal Starting Path</h3>
              <p className="text-xs text-slate-400 mb-3">
                Since you already solved ~200 LeetCode problems, skip Python basics and lock in this sequence:
              </p>
              <ol className="space-y-1.5">
                {PERSONAL_START_PATH.map((step, i) => (
                  <li key={step} className="flex items-center gap-2.5 text-xs text-slate-200">
                    <span className="h-5 w-5 rounded-full bg-sky-500/15 border border-sky-500/30 font-mono text-[10px] text-sky-300 flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-indigo-500/25 bg-[#0E121B] p-5">
              <h3 className="text-base font-bold text-white mb-1">Dynamic Programming Order</h3>
              <p className="text-xs text-slate-400 mb-3">
                Never jump straight to hard DP problems. Build up in this exact order:
              </p>
              <ul className="space-y-1.5">
                {DP_LEARNING_ORDER.map((step) => (
                  <li key={step} className="text-xs text-indigo-200/90 font-mono bg-[#090B10] border border-slate-800/80 rounded-lg px-3 py-1.5">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Pattern Recognition */}
      {subTab === 'patterns' && (
        <div className="rounded-2xl border border-slate-800 bg-[#0E121B] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-lg font-bold text-white">How to Recognize Which Technique to Use</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Recognition clues for coding interviews — always verify the problem satisfies the technique&apos;s prerequisites.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={patternQuery}
                  onChange={(e) => setPatternQuery(e.target.value)}
                  placeholder="Filter clue or technique..."
                  className="rounded-lg border border-slate-700 bg-[#090B10] pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                />
              </div>
              {['All', 'Array', 'Linear', 'Trees & Graphs', 'Optimization'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPatternCat(cat)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                    patternCat === cat
                      ? 'bg-sky-500 text-slate-950 font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#090B10] text-slate-400 font-mono text-xs">
                <tr>
                  <th className="px-4 py-3">When the question involves...</th>
                  <th className="px-4 py-3">Consider using...</th>
                  <th className="px-4 py-3">Group</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredPatterns.map((row) => (
                  <tr key={row.clue} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-200">{row.clue}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 text-xs font-mono font-semibold text-sky-300">
                        {row.technique}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{row.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: 150-Problem Practice Plan & 8-Step Mastery */}
      {subTab === 'practice' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#0E121B] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Recommended 150-Problem Practice Plan</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Topic-based distribution: <span className="text-emerald-400 font-semibold">30% Easy (45)</span> ·{' '}
                  <span className="text-amber-400 font-semibold">60% Medium (90)</span> ·{' '}
                  <span className="text-rose-400 font-semibold">10% Hard (15)</span>
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-emerald-300">
                  Easy 30%
                </span>
                <span className="rounded-lg bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-amber-300">
                  Medium 60%
                </span>
                <span className="rounded-lg bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 text-rose-300">
                  Hard 10%
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PRACTICE_PLAN.map((grp) => {
                const solved = progress.practiceSolved[grp.id] || 0;
                const pct = Math.min((solved / grp.target) * 100, 100);
                return (
                  <div
                    key={grp.id}
                    className="rounded-xl border border-slate-800 bg-[#090B10] p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-white">{grp.name}</h4>
                        <span className="font-mono text-xs font-bold text-amber-300">
                          {solved}/{grp.target}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{grp.focus}</p>
                    </div>

                    <div className="mt-3">
                      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden mb-3">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onUpdatePractice(grp.id, -1, grp.target)}
                          className="h-7 w-7 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-300 hover:bg-slate-800 cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onUpdatePractice(grp.id, 1, grp.target)}
                          className="h-7 w-7 rounded-lg border border-emerald-500/40 bg-emerald-500/15 flex items-center justify-center text-emerald-300 hover:bg-emerald-500/25 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0E121B] p-6">
            <h3 className="text-lg font-bold text-white mb-4">8-Step Process to Master Every Technique</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {MASTERY_STEPS.map((s) => (
                <div key={s.step} className="rounded-xl border border-slate-800 bg-[#090B10] p-4">
                  <span className="font-mono text-xs font-bold text-sky-400">STEP 0{s.step}</span>
                  <h4 className="text-sm font-bold text-white mt-1">{s.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inline Note Modal */}
      {editingNoteTopic && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#0F1420] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Notes — {editingNoteTopic.title}</h3>
            <p className="text-xs text-slate-400 mt-1">
              Write what you understood, edge cases, or Python templates. Saved locally immediately & synced when you click Save to GitHub.
            </p>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={7}
              placeholder="e.g., Remember: in binary search, use mid = left + (right - left) // 2 and check loop invariant..."
              className="mt-4 w-full rounded-xl border border-slate-700 bg-[#090B10] p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none font-mono"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditingNoteTopic(null)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInlineNote}
                className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 cursor-pointer"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
