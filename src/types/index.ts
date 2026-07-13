export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface LiveDocument {
  projectId: string;
  vision: string;
  hypotheses: string;
  decisions: string;
  conclusions: string;
  sources: string;
  risks: string;
  roadmap: string;
  technicalTasks: string;
  codexPrompts: string;
  changelog: string;
  updatedAt: string;
}

export interface AgentMessage {
  id: string;
  projectId?: string;
  role: "user" | "assistant" | "system";
  agent?: string;
  content: string;
  createdAt: string;
}

export interface Decision {
  id: string;
  projectId: string;
  title: string;
  rationale: string;
  status: "proposed" | "accepted" | "rejected";
  createdAt: string;
}

export interface Hypothesis {
  id: string;
  projectId: string;
  statement: string;
  confidence: "low" | "medium" | "high";
  evidence: string;
  createdAt: string;
}

export interface Risk {
  id: string;
  projectId: string;
  title: string;
  impact: "low" | "medium" | "high";
  mitigation: string;
  createdAt: string;
}

export interface Source {
  id: string;
  projectId: string;
  title: string;
  url?: string;
  note: string;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  projectId: string;
  title: string;
  assignee?: string;
  status: "todo" | "in_progress" | "done";
  createdAt: string;
}

export interface RoadmapItem {
  id: string;
  projectId: string;
  quarter: string;
  title: string;
  status: "planned" | "in_progress" | "shipped";
  createdAt: string;
}

export interface DebateRound {
  id: string;
  projectId: string;
  prompt: string;
  summary: string;
  qualityGate: {
    passed: boolean;
    warnings: string[];
    missingEvidence: string[];
    contradictions: string[];
  };
  createdAt: string;
}
