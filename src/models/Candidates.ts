// src/models/Candidate.ts
import { Schema, model, models } from "mongoose";

const CandidateSchema = new Schema({
  name: String,
  email: String,
  source: { type: String, default: "LinkedIn" },
  experience: Number, 
  skills: [String],
  avatar: String,
}, { timestamps: true });

export default models.Candidate || model("Candidate", CandidateSchema);
