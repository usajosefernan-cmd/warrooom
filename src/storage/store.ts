import type { Project, LiveDocument, AgentMessage, Decision, Hypothesis, Risk, Source, TaskItem, RoadmapItem, DebateRound } from "@/types";

export type {
 Project, LiveDocument, AgentMessage, Decision, Hypothesis, Risk, Source, TaskItem, RoadmapItem, DebateRound };

export interface Store {
  projects: Project[];
  documents: Record<string, LiveDocument>;
  messages: AgentMessage[];
  decisions: Decision[];
  hypotheses: Hypothesis[];
  risks: Risk[];
  sources: Source[];
  tasks: TaskItem[];
  roadmap: RoadmapItem[];
  rounds: DebateRound[];
  providers: {
    mode: string;
    availableProviders: string[];
    defaultModel: string | null;
    modelTasks: Record<string, string>;
    warnings: string[];
  };
}

const STORAGE_KEY = "war-room-store-v1";

const emptyProject = (): Project => ({
  id: globalThis.crypto?.randomUUID?.() ?? `p_${Date.now()}`,
  slug: "",
  name: "",
  description: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const emptyDocument = (projectId: string): LiveDocument => ({
  projectId,
  vision: "# Visión\n\n",
  hypotheses: "# Hipótesis\n\n",
  decisions: "# Decisiones\n\n",
  conclusions: "# Conclusiones vivas\n\n",
  sources: "# Fuentes\n\n",
  risks: "# Riesgos\n\n",
  roadmap: "# Roadmap\n\n",
  technicalTasks: "# Tareas técnicas\n\n",
  codexPrompts: "# Prompts\n\n",
  changelog: "# Changelog\n\n",
  updatedAt: new Date().toISOString(),
});

const defaultStore = (): Store => ({
  projects: [],
  documents: {},
  messages: [],
  decisions: [],
  hypotheses: [],
  risks: [],
  sources: [],
  tasks: [],
  roadmap: [],
  rounds: [],
  providers: {
    mode: "mock",
    availableProviders: [],
    defaultModel: null,
    modelTasks: {},
    warnings: ["No provider configuration loaded yet. AI runs in mock mode."],
  },
});

export function loadStore(): Store {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStore();
    return JSON.parse(raw) as Store;
  } catch {
    return defaultStore();
  }
}

export function saveStore(store: Store): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getProject(store: Store, projectId: string): Project | undefined {
  return store.projects.find((project) => project.id === projectId);
}

export function ensureProjectDocument(store: Store, projectId: string): Store {
  if (!store.documents[projectId]) {
    store.documents[projectId] = emptyDocument(projectId);
  }
  return store;
}

export function addProject(input: { name: string; description: string }): Store {
  const store = loadStore();
  const source = input.name.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  const project: Project = {
    ...emptyProject(),
    slug: source || `project-${Date.now()}`,
    name: input.name.trim() || "Sin nombre",
    description: input.description.trim(),
  };
  store.projects.push(project);
  ensureProjectDocument(store, project.id);
  saveStore(store);
  return store;
}

export function appendDocumentSection(store: Store, projectId: string, section: keyof LiveDocument, content: string): Store {
  ensureProjectDocument(store, projectId);
  const doc = store.documents[projectId];
  doc[section] = `${doc[section] ?? ""}${content}\n\n`;
  doc.updatedAt = new Date().toISOString();
  store.projects = store.projects.map((project) => (project.id === projectId ? { ...project, updatedAt: doc.updatedAt } : project));
  saveStore(store);
  return store;
}

export function addMessage(store: Store, message: Omit<AgentMessage, "id" | "createdAt">): Store {
  store.messages.push({
    id: globalThis.crypto?.randomUUID?.() ?? `m_${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...message,
  });
  saveStore(store);
  return store;
}

export function addRound(store: Store, round: Omit<DebateRound, "id" | "createdAt">): Store {
  store.rounds.push({
    id: globalThis.crypto?.randomUUID?.() ?? `r_${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...round,
  });
  saveStore(store);
  return store;
}
