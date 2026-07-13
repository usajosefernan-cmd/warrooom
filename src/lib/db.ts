import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "src", "storage", "db.json");

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: string; // "active" | "draft" | "archived"
  documents: {
    vision: string;
    hipotesis: string;
    decisiones: string;
    conclusiones_vivas: string;
    fuentes: string;
    riesgos: string;
    roadmap: string;
    tareas_tecnicas: string;
    prompts_para_codex: string;
    changelog: string;
  };
}

export interface AgentMessage {
  agent: string;
  role: string;
  main_points: string[];
  risks: string[];
  recommendations: string[];
  questions: string[];
  updates_to_memory: string[];
}

export interface QualityGateResult {
  passed: boolean;
  warnings: string[];
  missing_evidence: string[];
  contradictions: string[];
}

export interface DebateRound {
  id: string;
  debateId: string;
  roundNumber: number;
  userInput: string;
  agentMessages: AgentMessage[];
  summary: string;
  qualityGate: QualityGateResult;
  timestamp: string;
}

export interface Debate {
  id: string;
  projectId: string;
  title: string;
  createdAt: string;
  rounds: DebateRound[];
}

export interface Decision {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: "proposed" | "approved" | "rejected";
  debateRoundId?: string;
  createdAt: string;
}

export interface Hypothesis {
  id: string;
  projectId: string;
  statement: string;
  evidence: string;
  status: "unverified" | "validated" | "refuted";
  debateRoundId?: string;
  createdAt: string;
}

export interface Source {
  id: string;
  projectId: string;
  title: string;
  url?: string;
  description?: string;
  type: "url" | "book" | "expert" | "document" | "other";
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  debateRoundId?: string;
  createdAt: string;
}

export interface AILog {
  id: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  estimatedCost: number;
  latencyMs: number;
  timestamp: string;
  error?: string;
}

export interface Conclusion {
  id: string;
  projectId: string;
  roundNumber: number;
  text: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface DatabaseSchema {
  projects: Project[];
  debates: Debate[];
  decisions: Decision[];
  hypotheses: Hypothesis[];
  sources: Source[];
  tasks: Task[];
  roadmap_items: any[];
  ai_logs: AILog[];
  conclusions?: Conclusion[];
}

// Asegurarse de que el directorio existe
function ensureDirExists() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    const initialData: DatabaseSchema = {
      projects: [],
      debates: [],
      decisions: [],
      hypotheses: [],
      sources: [],
      tasks: [],
      roadmap_items: [],
      ai_logs: [],
      conclusions: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), "utf-8");
  }
}

export function readDB(): DatabaseSchema {
  ensureDirExists();
  try {
    const raw = fs.readFileSync(dbPath, "utf-8");
    const data = JSON.parse(raw);
    if (!data.conclusions) {
      data.conclusions = [];
    }
    return data;
  } catch (error) {
    console.error("Error reading database file", error);
    return {
      projects: [],
      debates: [],
      decisions: [],
      hypotheses: [],
      sources: [],
      tasks: [],
      roadmap_items: [],
      ai_logs: [],
      conclusions: []
    };
  }
}

export function writeDB(data: DatabaseSchema): boolean {
  ensureDirExists();
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing database file", error);
    return false;
  }
}

export function getProjectBySlug(slug: string): Project | undefined {
  const db = readDB();
  return db.projects.find((p) => p.slug === slug);
}

export function saveProject(project: Project): void {
  const db = readDB();
  const index = db.projects.findIndex((p) => p.id === project.id);
  if (index !== -1) {
    db.projects[index] = project;
  } else {
    db.projects.push(project);
  }
  writeDB(db);
}

export function getDebateById(id: string): Debate | undefined {
  const db = readDB();
  return db.debates.find((d) => d.id === id);
}

export function saveDebate(debate: Debate): void {
  const db = readDB();
  const index = db.debates.findIndex((d) => d.id === debate.id);
  if (index !== -1) {
    db.debates[index] = debate;
  } else {
    db.debates.push(debate);
  }
  writeDB(db);
}

export function getProjectDebates(projectId: string): Debate[] {
  const db = readDB();
  return db.debates.filter((d) => d.projectId === projectId);
}
