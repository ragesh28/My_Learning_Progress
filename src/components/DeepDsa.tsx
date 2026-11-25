import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Filter,
  Link as LinkIcon,
  Network,
  PlayCircle,
  Plus,
  Search,
  StickyNote,
  Trash2,
} from 'lucide-react';
import { ALGORITHMS_TREE, DATA_STRUCTURES_TREE } from '../data/deepDsaTrees';
import { Difficulty, TopicNote, TreeNodeData, UserProgressData } from '../types';
import { OsintTreeCanvas } from './OsintTreeCanvas';

interface DeepDsaProps {
  progress: UserProgressData;
  onSaveNote: (note: TopicNote) => void;
}

function collectAllIds(node: TreeNodeData): string[] {
  const ids = [node.id];
  if (node.children) {
    for (const c of node.children) {
      ids.push(...collectAllIds(c));
    }
  }
  return ids;
}

function findMatchingNodesAndAncestors(
  node: TreeNodeData,
  query: string,
  difficultyFilter: 'All' | Difficulty,
  onlyWithNotes: boolean,
  notedIds: Set<string>
): { matchedIds: Set<string>; ancestorIds: Set<string> } {
  const matchedIds = new Set<string>();
  const ancestorIds = new Set<string>();
  const q = query.trim().toLowerCase();

  function dfs(cur: TreeNodeData, ancestors: string[]): boolean {
    const textMatch =
      !q ||
      cur.name.toLowerCase().includes(q) ||
      (cur.summary?.toLowerCase().includes(q) ?? false) ||
      (cur.worksWith?.some((w) => w.toLowerCase().includes(q)) ?? false) ||
      (cur.exampleProblems?.some((p) => p.toLowerCase().includes(q)) ?? false);

    const diffMatch = difficultyFilter === 'All' || cur.difficulty === difficultyFilter;
    const noteMatch = !onlyWithNotes || notedIds.has(cur.id);

    const hasActiveFilter = Boolean(q) || difficultyFilter !== 'All' || onlyWithNotes;
    const selfMatches = hasActiveFilter && cur.kind !== 'root' && textMatch && diffMatch && noteMatch;

    let anyChildMatches = false;
    if (cur.children) {
      for (const child of cur.children) {
        if (dfs(child, [...ancestors, cur.id])) {
          anyChildMatches = true;
        }
      }
    }

    if (selfMatches) {
      matchedIds.add(cur.id);
      for (const a of ancestors) ancestorIds.add(a);
    }
    if (anyChildMatches) {
      ancestorIds.add(cur.id);
    }
    return selfMatches || anyChildMatches;
  }

  dfs(node, []);
  return { matchedIds, ancestorIds };
}

export const DeepDsa: React.FC<DeepDsaProps> = ({ progress, onSaveNote }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [treeScope, setTreeScope] = useState<'both' | 'ds' | 'alg'>('both');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | Difficulty>('All');
  const [onlyWithNotes, setOnlyWithNotes] = useState(false);

  const [dsExpanded, setDsExpanded] = useState<Set<string>>(
    () => new Set(['ds-root', 'ds-linear', 'ds-associative', 'ds-nonlinear'])
  );
  const [algExpanded, setAlgExpanded] = useState<Set<string>>(
    () => new Set(['alg-root', 'tech-searching', 'tech-two-pointers', 'tech-sorting'])
  );

  const [selectedNode, setSelectedNode] = useState<TreeNodeData>(
    ALGORITHMS_TREE.children?.[0]?.children?.[1] || ALGORITHMS_TREE
  );

  // Note editor state for currently selected node
  const currentSavedNote = progress.topicNotes[selectedNode.id];
  const [noteText, setNoteText] = useState(currentSavedNote?.content || '');
  const [noteLinks, setNoteLinks] = useState<{ title: string; url: string }[]>(
    currentSavedNote?.links || []
  );
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  const handleSelectNode = (node: TreeNodeData) => {
    setSelectedNode(node);
    const saved = progress.topicNotes[node.id];
    setNoteText(saved?.content || '');
    setNoteLinks(saved?.links || []);
    setJustSaved(false);
  };

  const notedIds = useMemo(() => {
    const set = new Set<string>();
    for (const [k, v] of Object.entries(progress.topicNotes)) {
      if (v.content.trim() || v.links.length > 0) set.add(k);
    }
    return set;
  }, [progress.topicNotes]);

  const dsSearch = useMemo(
    () => findMatchingNodesAndAncestors(DATA_STRUCTURES_TREE, searchQuery, difficultyFilter, onlyWithNotes, notedIds),
    [searchQuery, difficultyFilter, onlyWithNotes, notedIds]
  );

  const algSearch = useMemo(
    () => findMatchingNodesAndAncestors(ALGORITHMS_TREE, searchQuery, difficultyFilter, onlyWithNotes, notedIds),
    [searchQuery, difficultyFilter, onlyWithNotes, notedIds]
  );

  const effectiveDsExpanded = useMemo(() => {
    if (!searchQuery.trim() && difficultyFilter === 'All' && !onlyWithNotes) return dsExpanded;
    return new Set([...dsExpanded, ...dsSearch.ancestorIds]);
  }, [dsExpanded, dsSearch.ancestorIds, searchQuery, difficultyFilter, onlyWithNotes]);

  const effectiveAlgExpanded = useMemo(() => {
    if (!searchQuery.trim() && difficultyFilter === 'All' && !onlyWithNotes) return algExpanded;
    return new Set([...algExpanded, ...algSearch.ancestorIds]);
  }, [algExpanded, algSearch.ancestorIds, searchQuery, difficultyFilter, onlyWithNotes]);

  const toggleExpand = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    const title = newLinkTitle.trim() || newLinkUrl.trim();
    setNoteLinks((prev) => [...prev, { title, url: newLinkUrl.trim() }]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleSaveCurrentNote = () => {
    onSaveNote({
      topicId: selectedNode.id,
      topicName: selectedNode.name,
      content: noteText.trim(),
      links: noteLinks,
      updatedAt: new Date().toISOString(),
    });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  const totalMatches = dsSearch.matchedIds.size + algSearch.matchedIds.size;

  return (
    <div className="space-y-6 pb-16">
      {/* Header + Unified Search & Filter Bar */}
      <section className="rounded-2xl border border-slate-800 bg-[#0E121B] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
              <Network className="h-4 w-4" />
              OSINT-STYLE INTERACTIVE KNOWLEDGE TREES
            </div>
            <h1 className="text-2xl font-bold text-white">Deep DSA Explorer</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any node to expand/collapse branches, view compatible Data Structures, open its free animation site, and save personal notes.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Collapsed (click to expand)
            </span>
            <span className="inline-flex items-center gap-1.5 ml-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Has your note
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any algorithm, technique, or data structure (e.g., Binary Search, Two Pointers, Dijkstra)..."
              className="w-full rounded-xl border border-slate-700 bg-[#090B10] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Filter className="h-4 w-4 text-slate-500 mr-1" />
            {[
              { id: 'both', label: 'Both Trees' },
              { id: 'ds', label: 'Data Structures' },
              { id: 'alg', label: 'Algorithms' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTreeScope(item.id as 'both' | 'ds' | 'alg')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  treeScope === item.id
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as 'All' | Difficulty)}
              className="rounded-lg border border-slate-700 bg-[#090B10] px-2.5 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <button
              onClick={() => setOnlyWithNotes((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                onlyWithNotes
                  ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                  : 'border-slate-700 bg-[#090B10] text-slate-300 hover:border-slate-600'
              }`}
            >
              <StickyNote className="h-3.5 w-3.5" />
              My Notes ({notedIds.size})
            </button>
          </div>
        </div>

        {(searchQuery.trim() || difficultyFilter !== 'All' || onlyWithNotes) && (
          <div className="mt-3 text-xs text-emerald-300 font-mono">
            Matching nodes highlighted in emerald: {totalMatches}
          </div>
        )}
      </section>

      {/* Main Workspace: Trees on Left + Detail & Notes Inspector on Right */}
      <div className="grid gap-6 xl:grid-cols-12 items-start">
        <div className="xl:col-span-8 space-y-6">
          {/* Tree 1: Data Structures */}
          {(treeScope === 'both' || treeScope === 'ds') && (
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-sky-300 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                    Tree 1 — Data Structures (Linear · Associative · Non-Linear)
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDsExpanded(new Set(collectAllIds(DATA_STRUCTURES_TREE)))}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white cursor-pointer"
                  >
                    <ChevronDown className="h-3 w-3" /> Expand All
                  </button>
                  <button
                    onClick={() => setDsExpanded(new Set(['ds-root']))}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white cursor-pointer"
                  >
                    <ChevronRight className="h-3 w-3" /> Collapse
                  </button>
                </div>
              </div>

              <OsintTreeCanvas
                root={DATA_STRUCTURES_TREE}
                expandedIds={effectiveDsExpanded}
                selectedId={selectedNode.id}
                matchedIds={dsSearch.matchedIds}
                notedIds={notedIds}
                accent="sky"
                onToggleExpand={(id) => toggleExpand(setDsExpanded, id)}
                onSelectNode={handleSelectNode}
              />
            </div>
          )}

          {/* Tree 2: Algorithm Techniques & Real Algorithms */}
          {(treeScope === 'both' || treeScope === 'alg') && (
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-indigo-300 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                    Tree 2 — Algorithm Techniques → Sub-Techniques & Real Algorithms
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAlgExpanded(new Set(collectAllIds(ALGORITHMS_TREE)))}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white cursor-pointer"
                  >
                    <ChevronDown className="h-3 w-3" /> Expand All
                  </button>
                  <button
                    onClick={() => setAlgExpanded(new Set(['alg-root']))}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white cursor-pointer"
                  >
                    <ChevronRight className="h-3 w-3" /> Collapse
                  </button>
                </div>
              </div>

              <OsintTreeCanvas
                root={ALGORITHMS_TREE}
                expandedIds={effectiveAlgExpanded}
                selectedId={selectedNode.id}
                matchedIds={algSearch.matchedIds}
                notedIds={notedIds}
                accent="indigo"
                onToggleExpand={(id) => toggleExpand(setAlgExpanded, id)}
                onSelectNode={handleSelectNode}
              />
            </div>
          )}
        </div>

        {/* Right Sticky Inspector & Personal Notes Drawer */}
        <aside className="xl:col-span-4 xl:sticky xl:top-20 rounded-2xl border border-slate-800 bg-[#0E121B] p-5 space-y-5 shadow-xl">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-md bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-indigo-300">
                {selectedNode.kind}
              </span>
              {selectedNode.difficulty && (
                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                  {selectedNode.difficulty}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white">{selectedNode.name}</h3>
            {selectedNode.summary && (
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedNode.summary}
              </p>
            )}
          </div>

          {/* Compatible Data Structures */}
          {selectedNode.worksWith && selectedNode.worksWith.length > 0 && (
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Works With Data Structures
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.worksWith.map((ds) => (
                  <span
                    key={ds}
                    className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-200"
                  >
                    {ds}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Time & Space Complexity */}
          {(selectedNode.timeComplexity || selectedNode.spaceComplexity) && (
            <div className="grid gap-2 rounded-xl border border-slate-800 bg-[#090B10] p-3.5 text-xs">
              {selectedNode.timeComplexity && (
                <div>
                  <span className="font-mono text-slate-500">Time: </span>
                  <span className="font-mono text-emerald-300">{selectedNode.timeComplexity}</span>
                </div>
              )}
              {selectedNode.spaceComplexity && (
                <div>
                  <span className="font-mono text-slate-500">Space: </span>
                  <span className="font-mono text-sky-300">{selectedNode.spaceComplexity}</span>
                </div>
              )}
            </div>
          )}

          {/* Classic Problems */}
          {selectedNode.exampleProblems && selectedNode.exampleProblems.length > 0 && (
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Classic Problems
              </p>
              <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                {selectedNode.exampleProblems.map((prob) => (
                  <li key={prob}>{prob}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Free Animation Website Link */}
          {selectedNode.animation && (
            <a
              href={selectedNode.animation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-xl border border-sky-500/40 bg-gradient-to-r from-sky-500/15 to-indigo-500/15 p-3.5 hover:from-sky-500/25 hover:to-indigo-500/25 transition group"
            >
              <div className="flex items-center gap-3">
                <PlayCircle className="h-5 w-5 text-sky-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-sky-200">
                    {selectedNode.animation.label}
                  </p>
                  <p className="text-[11px] font-mono text-sky-300/80">
                    Free Animator · {selectedNode.animation.site}
                  </p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-sky-300 shrink-0" />
            </a>
          )}

          {/* Personal Notes Editor ("Add Note") */}
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <StickyNote className="h-4 w-4 text-amber-400" />
                My Understanding & Notes
              </p>
              {justSaved && (
                <span className="text-[11px] font-mono text-emerald-400">Saved ✓</span>
              )}
            </div>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={5}
              placeholder={`Write what you understood about ${selectedNode.name}, key patterns, or Python snippets...`}
              className="w-full rounded-xl border border-slate-700 bg-[#090B10] p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none font-mono"
            />

            {/* Custom links attached to this topic */}
            <div className="space-y-2">
              {noteLinks.map((lnk, idx) => (
                <div
                  key={`${lnk.url}-${idx}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-[#090B10] px-2.5 py-1.5 text-xs"
                >
                  <a
                    href={lnk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sky-300 hover:underline truncate"
                  >
                    <LinkIcon className="h-3 w-3 shrink-0" />
                    <span className="truncate">{lnk.title}</span>
                  </a>
                  <button
                    onClick={() => setNoteLinks((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              <div className="grid grid-cols-5 gap-1.5">
                <input
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  placeholder="Link title"
                  className="col-span-2 rounded-lg border border-slate-700 bg-[#090B10] px-2.5 py-1.5 text-[11px] text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                />
                <input
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="col-span-2 rounded-lg border border-slate-700 bg-[#090B10] px-2.5 py-1.5 text-[11px] text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                />
                <button
                  onClick={handleAddLink}
                  className="col-span-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 flex items-center justify-center cursor-pointer"
                  title="Attach link"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleSaveCurrentNote}
              className="w-full rounded-xl bg-sky-500 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 transition cursor-pointer"
            >
              Save Topic Note
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
