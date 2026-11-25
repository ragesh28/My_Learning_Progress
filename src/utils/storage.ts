import {
  AiEntry,
  GitHubSyncConfig,
  PublishedProgressFile,
  TopicNote,
  UserProgressData,
} from '../types';
import { decryptPrivateBundle, encryptPrivateBundle } from './auth';

const PROGRESS_KEY = 'dsa_ai_learning_progress_v2';
const GH_CONFIG_KEY = 'dsa_ai_github_sync_config_v2';

export const DEFAULT_PROGRESS: UserProgressData = {
  version: 2,
  updatedAt: null,
  completedTopics: [],
  completedChecklist: [],
  practiceSolved: {},
  topicNotes: {},
  aiEntries: [],
  encryptedPrivate: null,
};

export const DEFAULT_GH_CONFIG: GitHubSyncConfig = {
  owner: 'ragesh28',
  repo: 'My_Learning_Progress',
  branch: 'main',
  filePath: 'public/data/user-notes.json',
  token: '',
};

function normalizeTopicNotes(raw: unknown): Record<string, TopicNote> {
  if (!raw || typeof raw !== 'object') return {};
  const result: Record<string, TopicNote> = {};
  for (const [k, v] of Object.entries(raw as Record<string, Partial<TopicNote>>)) {
    if (!v) continue;
    result[k] = {
      topicId: v.topicId || k,
      topicName: v.topicName || k,
      content: v.content || '',
      links: Array.isArray(v.links) ? v.links : [],
      visibility: v.visibility === 'private' ? 'private' : 'public',
      updatedAt: v.updatedAt || new Date().toISOString(),
    };
  }
  return result;
}

function normalizeAiEntries(raw: unknown): AiEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: Partial<AiEntry>) => ({
    id: item.id || `ai-${Date.now()}`,
    title: item.title || 'Untitled',
    category: item.category || 'Note',
    status: item.status || 'To Read',
    visibility: item.visibility === 'private' ? 'private' : 'public',
    url: item.url,
    summary: item.summary || '',
    tags: Array.isArray(item.tags) ? item.tags : [],
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  }));
}

export function loadLocalProgress(): UserProgressData {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<UserProgressData>;
    return {
      version: 2,
      updatedAt: parsed.updatedAt ?? null,
      completedTopics: Array.isArray(parsed.completedTopics) ? parsed.completedTopics : [],
      completedChecklist: Array.isArray(parsed.completedChecklist) ? parsed.completedChecklist : [],
      practiceSolved: parsed.practiceSolved && typeof parsed.practiceSolved === 'object' ? parsed.practiceSolved : {},
      topicNotes: normalizeTopicNotes(parsed.topicNotes),
      aiEntries: normalizeAiEntries(parsed.aiEntries),
      encryptedPrivate: parsed.encryptedPrivate ?? null,
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveLocalProgress(data: UserProgressData): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

export async function fetchPublishedPublicData(): Promise<PublishedProgressFile | null> {
  try {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const res = await fetch(`${baseUrl}data/user-notes.json?t=${Date.now()}`);
    if (!res.ok) return null;
    return (await res.json()) as PublishedProgressFile;
  } catch {
    return null;
  }
}

export function mergePublishedIntoProgress(
  local: UserProgressData,
  published: PublishedProgressFile
): UserProgressData {
  const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
  const pubTime = published.updatedAt ? new Date(published.updatedAt).getTime() : 0;

  if (localTime > pubTime) {
    // Keep local edits if newer, but preserve encryptedPrivate if local lacks it
    return {
      ...local,
      encryptedPrivate: local.encryptedPrivate || published.encryptedPrivate || null,
    };
  }

  return {
    version: 2,
    updatedAt: published.updatedAt ?? null,
    completedTopics: Array.isArray(published.completedTopics) ? published.completedTopics : [],
    completedChecklist: Array.isArray(published.completedChecklist) ? published.completedChecklist : [],
    practiceSolved: published.practiceSolved || {},
    topicNotes: normalizeTopicNotes(published.publicTopicNotes),
    aiEntries: normalizeAiEntries(published.publicAiEntries),
    encryptedPrivate: published.encryptedPrivate ?? null,
  };
}

export async function unlockPrivateNotesInProgress(
  current: UserProgressData,
  password: string
): Promise<UserProgressData> {
  if (!current.encryptedPrivate) return current;
  try {
    const bundle = await decryptPrivateBundle(current.encryptedPrivate, password);
    const mergedNotes: Record<string, TopicNote> = {
      ...current.topicNotes,
      ...normalizeTopicNotes(bundle.topicNotes),
    };
    const existingIds = new Set(current.aiEntries.map((e) => e.id));
    const mergedAi = [
      ...current.aiEntries,
      ...normalizeAiEntries(bundle.aiEntries).filter((e) => !existingIds.has(e.id)),
    ];
    return {
      ...current,
      topicNotes: mergedNotes,
      aiEntries: mergedAi,
    };
  } catch {
    return current;
  }
}

export function loadGitHubConfig(): GitHubSyncConfig {
  try {
    const raw = localStorage.getItem(GH_CONFIG_KEY);
    if (!raw) return { ...DEFAULT_GH_CONFIG };
    const parsed = JSON.parse(raw) as Partial<GitHubSyncConfig>;
    return {
      owner: parsed.owner || DEFAULT_GH_CONFIG.owner,
      repo: parsed.repo || DEFAULT_GH_CONFIG.repo,
      branch: parsed.branch || DEFAULT_GH_CONFIG.branch,
      filePath: parsed.filePath || DEFAULT_GH_CONFIG.filePath,
      token: parsed.token || '',
    };
  } catch {
    return { ...DEFAULT_GH_CONFIG };
  }
}

export function saveGitHubConfig(config: GitHubSyncConfig): void {
  localStorage.setItem(GH_CONFIG_KEY, JSON.stringify(config));
}

function toBase64Utf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64Utf8(base64: string): string {
  const clean = base64.replace(/\n/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export async function buildPublishedFile(
  data: UserProgressData,
  ownerPassword: string | null
): Promise<PublishedProgressFile> {
  const publicTopicNotes: Record<string, TopicNote> = {};
  const privateTopicNotes: Record<string, TopicNote> = {};

  for (const [k, note] of Object.entries(data.topicNotes)) {
    if (note.visibility === 'private') privateTopicNotes[k] = note;
    else publicTopicNotes[k] = note;
  }

  const publicAiEntries = data.aiEntries.filter((e) => e.visibility !== 'private');
  const privateAiEntries = data.aiEntries.filter((e) => e.visibility === 'private');

  let encryptedPrivate = data.encryptedPrivate ?? null;
  if (ownerPassword && (Object.keys(privateTopicNotes).length > 0 || privateAiEntries.length > 0)) {
    encryptedPrivate = await encryptPrivateBundle(
      { topicNotes: privateTopicNotes, aiEntries: privateAiEntries },
      ownerPassword
    );
  } else if (ownerPassword && Object.keys(privateTopicNotes).length === 0 && privateAiEntries.length === 0) {
    encryptedPrivate = null;
  }

  return {
    version: 2,
    updatedAt: new Date().toISOString(),
    completedTopics: data.completedTopics,
    completedChecklist: data.completedChecklist,
    practiceSolved: data.practiceSolved,
    publicTopicNotes,
    publicAiEntries,
    encryptedPrivate,
  };
}

export async function pushProgressToGitHub(
  config: GitHubSyncConfig,
  data: UserProgressData,
  ownerPassword: string | null
): Promise<{ commitUrl?: string; message: string }> {
  if (!config.token.trim()) {
    throw new Error('Add your GitHub Personal Access Token first.');
  }

  const endpoint = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.token.trim()}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };

  let existingSha: string | undefined;
  const checkRes = await fetch(`${endpoint}?ref=${encodeURIComponent(config.branch)}`, { headers });
  if (checkRes.ok) {
    const existing = (await checkRes.json()) as { sha?: string };
    existingSha = existing.sha;
  } else if (checkRes.status !== 404) {
    const errText = await checkRes.text();
    throw new Error(`GitHub read failed (${checkRes.status}): ${errText.slice(0, 140)}`);
  }

  const publishedFile = await buildPublishedFile(data, ownerPassword);

  const body: Record<string, unknown> = {
    message: `chore: update public & encrypted private notes (${new Date().toLocaleDateString()})`,
    content: toBase64Utf8(JSON.stringify(publishedFile, null, 2)),
    branch: config.branch,
  };
  if (existingSha) {
    body.sha = existingSha;
  }

  const putRes = await fetch(endpoint, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(`GitHub save failed (${putRes.status}): ${errText.slice(0, 180)}`);
  }

  const result = (await putRes.json()) as { commit?: { html_url?: string } };
  return {
    commitUrl: result.commit?.html_url,
    message: 'Saved! Public notes are visible to everyone; private notes are encrypted.',
  };
}

export async function pullProgressFromGitHub(
  config: GitHubSyncConfig,
  ownerPassword: string | null
): Promise<UserProgressData> {
  if (!config.token.trim()) {
    throw new Error('Add your GitHub Personal Access Token first.');
  }

  const endpoint = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}?ref=${encodeURIComponent(config.branch)}`;
  const res = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${config.token.trim()}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GitHub pull failed (${res.status}): ${errText.slice(0, 160)}`);
  }

  const json = (await res.json()) as { content?: string };
  if (!json.content) {
    throw new Error('No file content returned from GitHub.');
  }
  const decoded = fromBase64Utf8(json.content);
  const parsed = JSON.parse(decoded) as PublishedProgressFile;

  let progress: UserProgressData = {
    version: 2,
    updatedAt: parsed.updatedAt ?? null,
    completedTopics: Array.isArray(parsed.completedTopics) ? parsed.completedTopics : [],
    completedChecklist: Array.isArray(parsed.completedChecklist) ? parsed.completedChecklist : [],
    practiceSolved: parsed.practiceSolved || {},
    topicNotes: normalizeTopicNotes(parsed.publicTopicNotes),
    aiEntries: normalizeAiEntries(parsed.publicAiEntries),
    encryptedPrivate: parsed.encryptedPrivate ?? null,
  };

  if (ownerPassword && progress.encryptedPrivate) {
    progress = await unlockPrivateNotesInProgress(progress, ownerPassword);
  }
  return progress;
}
