import { GitHubSyncConfig, UserProgressData } from '../types';

const PROGRESS_KEY = 'dsa_ai_learning_progress_v1';
const GH_CONFIG_KEY = 'dsa_ai_github_sync_config_v1';

export const DEFAULT_PROGRESS: UserProgressData = {
  version: 1,
  updatedAt: null,
  completedTopics: [],
  completedChecklist: [],
  practiceSolved: {},
  topicNotes: {},
  aiEntries: [],
};

export const DEFAULT_GH_CONFIG: GitHubSyncConfig = {
  owner: 'ragesh28',
  repo: 'My_Learning_Progress',
  branch: 'main',
  filePath: 'data/user-notes.json',
  token: '',
};

export function loadLocalProgress(): UserProgressData {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<UserProgressData>;
    return {
      version: 1,
      updatedAt: parsed.updatedAt ?? null,
      completedTopics: Array.isArray(parsed.completedTopics) ? parsed.completedTopics : [],
      completedChecklist: Array.isArray(parsed.completedChecklist) ? parsed.completedChecklist : [],
      practiceSolved: parsed.practiceSolved && typeof parsed.practiceSolved === 'object' ? parsed.practiceSolved : {},
      topicNotes: parsed.topicNotes && typeof parsed.topicNotes === 'object' ? parsed.topicNotes : {},
      aiEntries: Array.isArray(parsed.aiEntries) ? parsed.aiEntries : [],
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveLocalProgress(data: UserProgressData): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
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

export async function pushProgressToGitHub(
  config: GitHubSyncConfig,
  data: UserProgressData
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

  const payload: UserProgressData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const body: Record<string, unknown> = {
    message: `chore: update DSA & AI learning progress (${new Date().toLocaleDateString()})`,
    content: toBase64Utf8(JSON.stringify(payload, null, 2)),
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
    message: 'Saved directly to GitHub!',
  };
}

export async function pullProgressFromGitHub(config: GitHubSyncConfig): Promise<UserProgressData> {
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
  const parsed = JSON.parse(decoded) as Partial<UserProgressData>;
  return {
    ...DEFAULT_PROGRESS,
    ...parsed,
    completedTopics: Array.isArray(parsed.completedTopics) ? parsed.completedTopics : [],
    completedChecklist: Array.isArray(parsed.completedChecklist) ? parsed.completedChecklist : [],
    practiceSolved: parsed.practiceSolved || {},
    topicNotes: parsed.topicNotes || {},
    aiEntries: Array.isArray(parsed.aiEntries) ? parsed.aiEntries : [],
  };
}
