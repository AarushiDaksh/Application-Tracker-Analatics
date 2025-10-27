export type KanbanStage = "Applied" | "Interview" | "Offer" | "Rejected";

export type AIFields = {
  summary?: string;
  keySkills?: string[];
  fitScore?: number;
  suggestedStage?: KanbanStage;
  reasoning?: string;
};

export type App = {
  _id: string;
  stage: KanbanStage;
  candidate: { name: string };
  job: { title: string; company?: string };
  skills?: string[];
  yearsOfExperience?: number;
  resumeLink?: string;
  createdAt: string;  
  updatedAt: string;
};

