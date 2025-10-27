// src/models/Application.ts
import mongoose, { Schema, model, models } from "mongoose";

const CandidateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const JobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
  },
  { _id: false }
);

const ApplicationSchema = new Schema(
  {
    stage: {
      type: String,
      enum: ["Applied", "Interview", "Offer", "Rejected"],
      required: true,
    },
    candidate: { type: CandidateSchema, required: true }, // ✅ subdocument
    job: { type: JobSchema, required: true },             // ✅ subdocument
    skills: [{ type: String, trim: true }],
    yearsOfExperience: { type: Number, min: 0 },
    resumeLink: { type: String, trim: true },
  },
  { timestamps: true }
);


try {
  mongoose.deleteModel("Application");
} catch {}

export const Application =
  models.Application || model("Application", ApplicationSchema);