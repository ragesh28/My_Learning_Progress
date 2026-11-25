import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Trophy, AlertTriangle, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const SORTED_ARRAY = [4, 9, 14, 19, 25, 31, 38, 44, 52, 60, 67, 72, 81, 89, 95];
const TARGET = 67; // Located at index 10 -> Linear Search takes 11 steps, Binary Search takes 4 steps!

interface BinaryLevel {
  level: number;
  low: number;
  high: number;
  mid: number;
  midVal: number;
  decision: 'right' | 'left' | 'found';
  narration: string;
}

const BINARY_LEVELS: BinaryLevel[] = [
  {
    level: 1,
    low: 0,
    high: 14,
    mid: 7,
    midVal: 44,
    decision: 'right',
    narration: 'Step 1: Split the full sorted array [0..14]. Middle index is 7 (value 44). Since 67 > 44, discard the entire LEFT half and keep only [8..14].',
  },
  {
    level: 2,
    low: 8,
    high: 14,
    mid: 11,
    midVal: 72,
    decision: 'left',
    narration: 'Step 2: Split [8..14]. Middle index is 11 (value 72). Since 67 < 72, discard the RIGHT half and keep only [8..10].',
  },
  {
    level: 3,
    low: 8,
    high: 10,
    mid: 9,
    midVal: 60,
    decision: 'right',
    narration: 'Step 3: Split [8..10]. Middle index is 9 (value 60). Since 67 > 60, discard the left half and keep only [10..10].',
  },
  {
    level: 4,
    low: 10,
    high: 10,
    mid: 10,
    midVal: 67,
    decision: 'found',
    narration: 'Step 4: Middle index is 10 (value 67) === Target 67! Found in just 4 steps!',
  },
];

// Total timeline ticks:
// 0..10 = Linear search checking index 0..10 (11 steps)
// 11 = Transition pause showing Linear Search result (11 steps)
// 12..15 = Binary Search tree levels 1..4
// 16 = Final Winner Comparison
const MAX_STEP = 16;

export const SearchShowdown: React.FC = () => {
  const [showAnswerPrompt, setShowAnswerPrompt] = useState(false);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);

  // 2-second pop-up reveal asking user if they want to see the effective answer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnswerPrompt(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-advance video-like animation
  useEffect(() => {
    if (!playing) return;
    if (step >= MAX_STEP) {
      setPlaying(false);
      return;
    }
    const delay = step < 11 ? 380 : step === 11 ? 1100 : 1450;
    const id = setTimeout(() => {
      setStep((s) => Math.min(s + 1, MAX_STEP));
    }, delay);
    return () => clearTimeout(id);
  }, [playing, step]);

  const handleStartShowdown = () => {
    setStarted(true);
    setStep(0);
    setPlaying(true);
  };

  const handleReset = () => {
    setStarted(false);
    setPlaying(false);
    setStep(-1);
  };

  const handleNextStep = () => {
    if (!started) {
      setStarted(true);
      setStep(0);
      setPlaying(false);
      return;
    }
    setPlaying(false);
    setStep((s) => Math.min(s + 1, MAX_STEP));
  };

  const linearIndex = step >= 0 ? Math.min(step, 10) : -1;
  const linearStepsTaken = step >= 0 ? Math.min(step + 1, 11) : 0;
  const linearFinished = step >= 10;
  const binaryVisibleCount = step >= 12 ? Math.min(step - 11, BINARY_LEVELS.length) : 0;
  const showWinner = step >= 16;

  return (
    <section className="rounded-2xl border border-slate-800/80 bg-[#0E121B] p-6 sm:p-8 shadow-2xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Interactive Algorithm Story — Why Algorithms Matter
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Find the Position of <span className="font-mono text-amber-300">{TARGET}</span>
          </h2>
          <p className="mt-1.5 text-sm text-slate-400 max-w-2xl">
            Watch the difference between searching one by one without an algorithm versus using <strong className="text-sky-300">Binary Search</strong> in a splitting tree.
          </p>
        </div>

        {started && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 transition cursor-pointer"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {playing ? 'Pause' : step >= MAX_STEP ? 'Replay' : 'Play'}
            </button>
            <button
              onClick={handleNextStep}
              disabled={step >= MAX_STEP}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
            >
              <SkipForward className="h-3.5 w-3.5" />
              Next
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Sorted Array with Index Values Below */}
      <div className="rounded-xl border border-slate-800 bg-[#090B10] p-4 sm:p-5 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Sorted Array (15 elements) · Target = <span className="text-amber-300 font-bold">{TARGET}</span>
          </span>
          <span className="text-xs font-mono text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            Sorted ascending ✓
          </span>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="grid grid-cols-15 gap-1.5 min-w-[640px]">
            {SORTED_ARRAY.map((val, idx) => {
              const isLinearCurrent = started && step <= 11 && linearIndex === idx;
              const isLinearChecked = started && idx < linearIndex;
              const isTargetFound = started && linearFinished && idx === 10;

              let cellStyle = 'border-slate-800 bg-[#121724] text-slate-200';
              if (isTargetFound) {
                cellStyle = 'border-emerald-400 bg-emerald-500/20 text-emerald-200 ring-2 ring-emerald-500/40';
              } else if (isLinearCurrent) {
                cellStyle = 'border-rose-400 bg-rose-500/20 text-rose-200 scale-105';
              } else if (isLinearChecked) {
                cellStyle = 'border-rose-900/70 bg-rose-950/30 text-rose-300/70';
              }

              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-full h-11 rounded-lg border flex items-center justify-center font-mono text-sm font-semibold transition-all duration-200 ${cellStyle}`}
                  >
                    {val}
                  </div>
                  <span className="mt-1.5 font-mono text-[11px] text-slate-500">[{idx}]</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Human Question Pop-up & 2-Second Delayed Answer CTA */}
      {!started && (
        <div className="grid gap-4 md:grid-cols-2 items-center rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-1">
              Question for You
            </p>
            <p className="text-base font-medium text-white">
              You want to find the exact index of <span className="font-mono text-amber-300">{TARGET}</span> in this list. How would a human normally search for it — and how can an algorithm do it dramatically faster?
            </p>
          </div>
          <div className="flex md:justify-end">
            {!showAnswerPrompt ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                Preparing interactive answer...
              </div>
            ) : (
              <button
                onClick={handleStartShowdown}
                className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-indigo-400 transition cursor-pointer"
              >
                Show Answer: How to Find It Effectively
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Act 1: Linear Search Live Narrative */}
      {started && (
        <div className="space-y-5 mt-5">
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/15 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <h3 className="text-sm font-bold text-rose-200">
                  1. Normal Way (Without an Algorithm — Linear Search)
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded-md">
                Steps checked: {linearStepsTaken} / 11
              </span>
            </div>
            <p className="text-sm text-slate-300">
              {linearFinished
                ? `Checked index 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, and finally 10 → took 11 steps! Imagine doing this one by one on 1,000,000 items.`
                : `Checking index [${linearIndex}] (value ${SORTED_ARRAY[linearIndex]})... Not ${TARGET}, moving to the next element one by one.`}
            </p>
          </div>

          {/* Act 2: Binary Search Splitting Tree Animation */}
          {binaryVisibleCount > 0 && (
            <div className="rounded-xl border border-sky-500/30 bg-[#0A0F1A] p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-sky-300">
                    2. The Solution: Binary Search (Tree-Split Animation)
                  </h3>
                  <p className="text-xs text-amber-300/90 mt-0.5 font-medium">
                    Rule: Binary Search ONLY works on a sorted array.
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-sky-200 bg-sky-500/15 border border-sky-500/30 px-3 py-1 rounded-md">
                  Binary Steps: {binaryVisibleCount} / 4
                </span>
              </div>

              <div className="space-y-4">
                {BINARY_LEVELS.slice(0, binaryVisibleCount).map((lvl, idx) => {
                  const isLatest = idx === binaryVisibleCount - 1;
                  return (
                    <div
                      key={lvl.level}
                      className={`rounded-xl border p-4 transition-all duration-300 ${
                        lvl.decision === 'found'
                          ? 'border-emerald-500/50 bg-emerald-950/20'
                          : isLatest
                            ? 'border-sky-500/40 bg-sky-950/15'
                            : 'border-slate-800/80 bg-[#0D1320]'
                      }`}
                    >
                      {/* Connector from previous level */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-sky-300">
                          <span className="h-5 w-5 rounded-full bg-sky-500/20 border border-sky-400/50 inline-flex items-center justify-center text-[11px]">
                            {lvl.level}
                          </span>
                          Active Subarray [{lvl.low}..{lvl.high}] · Mid = [{lvl.mid}] ({lvl.midVal})
                        </span>
                        <span
                          className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${
                            lvl.decision === 'found'
                              ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                              : lvl.decision === 'right'
                                ? 'border-amber-400/40 bg-amber-500/15 text-amber-200'
                                : 'border-indigo-400/40 bg-indigo-500/15 text-indigo-200'
                          }`}
                        >
                          {lvl.decision === 'found'
                            ? 'FOUND AT INDEX 10 ✓'
                            : lvl.decision === 'right'
                              ? '67 > mid → Take RIGHT half ↓'
                              : '67 < mid → Take LEFT half ↓'}
                        </span>
                      </div>

                      {/* Visual Split Cells */}
                      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
                        {SORTED_ARRAY.slice(lvl.low, lvl.high + 1).map((val, offset) => {
                          const realIdx = lvl.low + offset;
                          const isMid = realIdx === lvl.mid;
                          const isDiscarded =
                            (lvl.decision === 'right' && realIdx <= lvl.mid) ||
                            (lvl.decision === 'left' && realIdx >= lvl.mid);

                          let cls = 'border-sky-500/40 bg-sky-500/10 text-sky-100';
                          if (isMid && lvl.decision === 'found') {
                            cls = 'border-emerald-400 bg-emerald-500/25 text-emerald-200 ring-2 ring-emerald-400/40 scale-105';
                          } else if (isMid) {
                            cls = 'border-amber-400 bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40';
                          } else if (isDiscarded) {
                            cls = 'border-slate-800 bg-slate-900/40 text-slate-600 line-through opacity-45';
                          }

                          return (
                            <div key={realIdx} className="flex flex-col items-center">
                              <div className={`min-w-[40px] px-2 h-9 rounded-md border flex items-center justify-center font-mono text-xs font-semibold ${cls}`}>
                                {val}
                              </div>
                              <span className="mt-1 font-mono text-[10px] text-slate-500">[{realIdx}]</span>
                            </div>
                          );
                        })}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {lvl.narration}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Act 3: Final Winner Comparison */}
          {showWinner && (
            <div className="grid gap-4 md:grid-cols-2 pt-2">
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-rose-300">Without Algorithm</span>
                  <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 text-xs font-bold text-rose-300">
                    SLOW · O(n)
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white">Linear Search</h4>
                <p className="mt-2 text-3xl font-mono font-extrabold text-rose-400">11 steps</p>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Scans elements one by one. For 1,000,000 items, worst case takes <strong className="text-rose-300">1,000,000 steps</strong>.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/20 p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold">
                    <Trophy className="h-4 w-4 text-amber-300" />
                    Winner · O(log n)
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-xs font-bold text-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    2.75× Faster Here
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white">Binary Search</h4>
                <p className="mt-2 text-3xl font-mono font-extrabold text-emerald-400">4 steps</p>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Cuts the search space in half every step. For 1,000,000 sorted items, worst case takes only <strong className="text-emerald-300">20 steps</strong>!
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
