import React from 'react';
import { ArrowRight, Boxes, Cpu, Gauge, HelpCircle, Layers, Network, Sparkles } from 'lucide-react';
import {
  CLASSIFICATION_CLARIFIER,
  COMPLEXITY_GUIDE,
  DATA_STRUCTURE_EXAMPLES,
  LEARNING_CHAINS,
} from '../data/dsaRoadmap';
import { NavTab } from '../types';
import { SearchShowdown } from './SearchShowdown';

interface DsaHomeProps {
  onNavigate: (tab: NavTab) => void;
}

export const DsaHome: React.FC<DsaHomeProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-[#0F1626] via-[#0B0F1A] to-[#0A131F] p-7 sm:p-10 shadow-2xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-medium text-sky-300 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Complete DSA Roadmap — Beginner to Advanced (Python)
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Learn Data Structures & Algorithms{' '}
            <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Together in Logical Order
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            The right way to master DSA is not to finish all data structures first, then all algorithms, and finally techniques. Learn them together so you understand <strong className="text-white">what an algorithm does</strong>, <strong className="text-white">where it fits</strong>, and <strong className="text-white">why it works</strong>.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('learn')}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition cursor-pointer"
            >
              Open Learn DSA Roadmap
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('deep')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:border-sky-500/50 hover:text-white transition cursor-pointer"
            >
              <Network className="h-4 w-4 text-sky-400" />
              Explore Deep DSA Tree
            </button>
          </div>
        </div>

        {/* 4 Logical Chains */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LEARNING_CHAINS.map((chain) => (
            <div
              key={chain.title}
              className="rounded-xl border border-slate-800/90 bg-[#090C14]/90 p-4"
            >
              <p className="text-xs font-mono uppercase tracking-wider text-sky-400 mb-2">
                {chain.title}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-200">
                {chain.steps.map((s, idx) => (
                  <React.Fragment key={s}>
                    <span className="rounded-md bg-slate-800/80 px-2 py-0.5 font-medium">{s}</span>
                    {idx < chain.steps.length - 1 && <span className="text-slate-600">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Split Concept: Data Structure vs Algorithm */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-sky-500/25 bg-[#0E131F] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-300">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400">Part 1 · Storage</span>
              <h2 className="text-xl font-bold text-white">What is a Data Structure?</h2>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            A <strong className="text-white">Data Structure</strong> is a way of organizing and storing data in memory so you can access, search, insert, or update it efficiently. Different problems need different structures — just like you store clothes in a closet, contacts in a phonebook, and browser tabs in a history stack.
          </p>
          <div className="rounded-xl border border-slate-800 bg-[#090B10] p-4 text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-sky-300">Why use different Data Structures?</p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400">
              <li>Need instant lookup by index? Use an <strong className="text-slate-200">Array</strong>.</li>
              <li>Need instant lookup by key/name? Use a <strong className="text-slate-200">Hash Map</strong>.</li>
              <li>Need Undo/Redo or matching brackets? Use a <strong className="text-slate-200">Stack</strong>.</li>
              <li>Need road routes or social networks? Use a <strong className="text-slate-200">Graph</strong>.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-500/25 bg-[#0E131F] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400">Part 2 · Procedure</span>
              <h2 className="text-xl font-bold text-white">What is an Algorithm?</h2>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            An <strong className="text-white">Algorithm</strong> is a clear, step-by-step recipe for solving a problem using one or more data structures. An <strong className="text-indigo-300">Algorithmic Technique</strong> (like Two Pointers, Sliding Window, or Dynamic Programming) is a reusable strategy that shapes how you design algorithms.
          </p>
          <div className="rounded-xl border border-amber-500/25 bg-amber-950/15 p-4 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-amber-300 mb-1.5">
              <HelpCircle className="h-4 w-4" />
              Common Mistake: Is Dynamic Programming a non-linear data structure?
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">No!</strong> Dynamic Programming is an <strong className="text-amber-200">algorithmic technique</strong>, not a data structure. DP can use arrays, hash maps, or trees under the hood.
            </p>
          </div>
        </div>
      </section>

      {/* Classification of Data Structures with Real-World Use Cases */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <Layers className="h-5 w-5 text-sky-400" />
          <h2 className="text-2xl font-bold text-white">1. Classification of Data Structures</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {DATA_STRUCTURE_EXAMPLES.map((group) => (
            <div
              key={group.group}
              className="rounded-2xl border border-slate-800/90 bg-[#0E121B] p-5 flex flex-col"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-base font-bold text-white">{group.group}</h3>
                <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-mono text-sky-300">
                  {group.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">{group.description}</p>
              <div className="space-y-3 flex-1">
                {group.items.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-xl border border-slate-800/80 bg-[#090B10] p-3.5"
                  >
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.what}</p>
                    <p className="text-xs text-emerald-300/90 mt-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mr-1.5">
                        Real use:
                      </span>
                      {item.realWorld}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Term Classification Quick Table */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-[#0E121B] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Don&apos;t Confuse These Terms</h3>
            <span className="text-xs font-mono text-slate-400">Quick Reference</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#090B10] text-slate-400 font-mono text-xs">
                <tr>
                  <th className="px-5 py-3">Term</th>
                  <th className="px-5 py-3">Exact Classification</th>
                  <th className="px-5 py-3">Key Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {CLASSIFICATION_CLARIFIER.map((row) => (
                  <tr key={row.term} className="hover:bg-slate-800/30">
                    <td className="px-5 py-3 font-medium text-white">{row.term}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-xs font-mono text-indigo-200">
                        {row.classification}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Interactive Linear Search vs Binary Search Animated Showdown */}
      <SearchShowdown />

      {/* Time & Space Complexity in Plain Human Language */}
      <section>
        <div className="flex items-center gap-2.5 mb-2">
          <Gauge className="h-5 w-5 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Time & Space Complexity — Explained for Humans</h2>
        </div>
        <p className="text-sm text-slate-400 mb-6 max-w-3xl">
          <strong className="text-slate-200">Time complexity</strong> measures how fast steps grow as input size <span className="font-mono text-sky-300">n</span> increases. <strong className="text-slate-200">Space complexity</strong> measures how much extra memory your solution needs.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COMPLEXITY_GUIDE.map((item) => (
            <div
              key={item.notation}
              className="rounded-2xl border border-slate-800 bg-[#0E121B] p-5 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xl font-extrabold text-sky-300">{item.notation}</span>
                <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                  {item.speed}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{item.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{item.realExample}</p>
              <div className="rounded-lg border border-slate-800/80 bg-[#090B10] px-3 py-2 text-[11px] text-slate-400">
                <span className="font-mono text-indigo-300 mr-1">Space:</span>
                {item.spaceExample}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
