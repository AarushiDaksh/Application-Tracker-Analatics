// src/types/kanban.ts
export type KanbanStage =
  | "Applied"
  | "Interview"
  | "Offer"
  | "Rejected";

export type App = {
  _id: string;
  stage: KanbanStage;
  candidate: { name: string; avatar?: string };
  job: { title: string; company?: string; location?: string };
  skills?: string[];
  createdAt?: string;
};
