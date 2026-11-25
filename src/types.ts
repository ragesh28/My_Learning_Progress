export type NavTab = 'home' | 'learn' | 'deep' | 'ai';

export type NoteVisibility = 'public' | 'private';

export type TopicCategory =
  | 'Foundation'
  | 'Data Structure'
  | 'Linear Sequence'
  | 'Algorithm'
  | 'Algorithm Variations'
  | 'Technique'
  | 'Abstract Data Type'
  | 'Pattern';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface RoadmapTopic {
  id: string;
  order: number;
  title: string;
  category: TopicCategory;
  phase: number;
  difficulty: Difficulty;
  concepts: string[];
  pythonTip?: string;
}

export interface RoadmapPhase {
  phase: number;
  title: string;
  level: string;
  subtitle: string;
  pythonNote?: string;
  topics: RoadmapTopic[];
}

export interface ChecklistItem {
  id: string;
  order: number;
  title: string;
  subtitle: string;
}

export interface RecognitionClue {
  clue: string;
  technique: string;
  category: 'Array' | 'Linear' | 'Trees & Graphs' | 'Optimization';
}

export interface PracticeGroup {
  id: string;
  name: string;
  target: number;
  focus: string;
}

export interface AnimationLink {
  site: string;
  label: string;
  url: string;
}

export interface TreeNodeData {
  id: string;
  name: string;
  kind: 'root' | 'group' | 'ds' | 'technique' | 'algorithm';
  difficulty?: Difficulty;
  summary?: string;
  worksWith?: string[];
  timeComplexity?: string;
  spaceComplexity?: string;
  exampleProblems?: string[];
  animation?: AnimationLink;
  children?: TreeNodeData[];
}

export interface TopicNote {
  topicId: string;
  topicName: string;
  content: string;
  links: { title: string; url: string }[];
  visibility: NoteVisibility;
  updatedAt: string;
}

export interface AiEntry {
  id: string;
  title: string;
  category: 'Paper' | 'LLMs' | 'Agents' | 'RAG' | 'ML Foundations' | 'Tool / Repo' | 'Note';
  status: 'To Read' | 'Reading' | 'Mastered';
  visibility: NoteVisibility;
  url?: string;
  summary: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EncryptedPayload {
  iv: string;
  salt: string;
  ciphertext: string;
}

export interface PrivateBundle {
  topicNotes: Record<string, TopicNote>;
  aiEntries: AiEntry[];
}

export interface PublishedProgressFile {
  version: number;
  updatedAt: string | null;
  completedTopics: string[];
  completedChecklist: string[];
  practiceSolved: Record<string, number>;
  publicTopicNotes: Record<string, TopicNote>;
  publicAiEntries: AiEntry[];
  encryptedPrivate?: EncryptedPayload | null;
}

export interface UserProgressData {
  version: number;
  updatedAt: string | null;
  completedTopics: string[];
  completedChecklist: string[];
  practiceSolved: Record<string, number>;
  topicNotes: Record<string, TopicNote>;
  aiEntries: AiEntry[];
  encryptedPrivate?: EncryptedPayload | null;
}

export interface GitHubSyncConfig {
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
  token: string;
}
