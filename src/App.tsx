import React, { useEffect, useState } from 'react';
import { BookOpen, BrainCircuit, CloudUpload, Home, Network, Terminal } from 'lucide-react';
import { AiHub } from './components/AiHub';
import { DeepDsa } from './components/DeepDsa';
import { DsaHome } from './components/DsaHome';
import { GitHubSyncModal } from './components/GitHubSyncModal';
import { LearnDsa } from './components/LearnDsa';
import { AiEntry, GitHubSyncConfig, NavTab, TopicNote, UserProgressData } from './types';
import { loadGitHubConfig, loadLocalProgress, saveLocalProgress } from './utils/storage';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [progress, setProgress] = useState<UserProgressData>(() => loadLocalProgress());
  const [ghConfig, setGhConfig] = useState<GitHubSyncConfig>(() => loadGitHubConfig());
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    saveLocalProgress(progress);
  }, [progress]);

  const mutateProgress = (updater: (prev: UserProgressData) => UserProgressData) => {
    setProgress((prev) => ({
      ...updater(prev),
      updatedAt: new Date().toISOString(),
    }));
    setHasUnsavedChanges(true);
  };

  const handleToggleTopic = (topicId: string) => {
    mutateProgress((prev) => {
      const exists = prev.completedTopics.includes(topicId);
      return {
        ...prev,
        completedTopics: exists
          ? prev.completedTopics.filter((id) => id !== topicId)
          : [...prev.completedTopics, topicId],
      };
    });
  };

  const handleToggleChecklist = (chkId: string) => {
    mutateProgress((prev) => {
      const exists = prev.completedChecklist.includes(chkId);
      return {
        ...prev,
        completedChecklist: exists
          ? prev.completedChecklist.filter((id) => id !== chkId)
          : [...prev.completedChecklist, chkId],
      };
    });
  };

  const handleResetChecklist = () => {
    mutateProgress((prev) => ({ ...prev, completedChecklist: [] }));
  };

  const handleUpdatePractice = (groupId: string, delta: number, max: number) => {
    mutateProgress((prev) => {
      const cur = prev.practiceSolved[groupId] || 0;
      const next = Math.max(0, Math.min(max, cur + delta));
      return {
        ...prev,
        practiceSolved: { ...prev.practiceSolved, [groupId]: next },
      };
    });
  };

  const handleSaveNote = (note: TopicNote) => {
    mutateProgress((prev) => ({
      ...prev,
      topicNotes: { ...prev.topicNotes, [note.topicId]: note },
    }));
  };

  const handleAddOrUpdateAi = (entry: AiEntry) => {
    mutateProgress((prev) => {
      const exists = prev.aiEntries.some((e) => e.id === entry.id);
      return {
        ...prev,
        aiEntries: exists
          ? prev.aiEntries.map((e) => (e.id === entry.id ? entry : e))
          : [entry, ...prev.aiEntries],
      };
    });
  };

  const handleDeleteAi = (id: string) => {
    mutateProgress((prev) => ({
      ...prev,
      aiEntries: prev.aiEntries.filter((e) => e.id !== id),
    }));
  };

  const navItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'DSA Home', icon: Home },
    { id: 'learn', label: 'Learn DSA', icon: BookOpen },
    { id: 'deep', label: 'Deep DSA', icon: Network },
    { id: 'ai', label: 'AI', icon: BrainCircuit },
  ];

  return (
    <div className="min-h-screen bg-[#090B10] text-slate-100">
      {/* Sticky Glassmorphic Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#090B10]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left cursor-pointer shrink-0"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-lg shadow-sky-500/20">
              <Terminal className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-extrabold tracking-tight text-white leading-none">
                My Learning Progress
              </p>
              <p className="text-[10px] font-mono text-sky-400 mt-0.5">DSA · DEEP TREES · AI</p>
            </div>
          </button>

          {/* Main Section Tabs */}
          <nav className="flex items-center gap-1 rounded-xl border border-slate-800 bg-[#0E121B] p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    active
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: Save to GitHub */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0E121B] px-2.5 py-1.5 text-xs font-mono text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {progress.completedTopics.length}/57
            </div>

            <button
              onClick={() => setSyncModalOpen(true)}
              className="relative inline-flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/15 px-3.5 py-2 text-xs font-semibold text-sky-200 hover:bg-sky-500/25 transition cursor-pointer"
            >
              <CloudUpload className="h-4 w-4 text-sky-400" />
              <span className="hidden sm:inline">Save to GitHub</span>
              <span className="sm:hidden">Save</span>
              {hasUnsavedChanges && (
                <span className="h-2 w-2 rounded-full bg-amber-400" title="Unsaved local changes" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-8">
        {activeTab === 'home' && <DsaHome onNavigate={setActiveTab} />}
        {activeTab === 'learn' && (
          <LearnDsa
            progress={progress}
            onToggleTopic={handleToggleTopic}
            onToggleChecklist={handleToggleChecklist}
            onResetChecklist={handleResetChecklist}
            onUpdatePractice={handleUpdatePractice}
            onSaveNote={handleSaveNote}
          />
        )}
        {activeTab === 'deep' && <DeepDsa progress={progress} onSaveNote={handleSaveNote} />}
        {activeTab === 'ai' && (
          <AiHub
            entries={progress.aiEntries}
            onAddOrUpdate={handleAddOrUpdateAi}
            onDelete={handleDeleteAi}
          />
        )}
      </main>

      <GitHubSyncModal
        open={syncModalOpen}
        config={ghConfig}
        progress={progress}
        onClose={() => setSyncModalOpen(false)}
        onConfigChange={setGhConfig}
        onImportData={(data) => {
          setProgress(data);
          setHasUnsavedChanges(false);
        }}
        onSyncSuccess={() => setHasUnsavedChanges(false)}
      />
    </div>
  );
}

export default App;
