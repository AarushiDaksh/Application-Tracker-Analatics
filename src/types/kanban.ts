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
  job: { title: string; company?: string; description?: string };
  skills?: string[];
  yearsOfExperience?: number;
  resumeLink?: string;
  resumeText?: string;      
  ai?: AIFields;            
  createdAt?: string;
  updatedAt?: string;
};