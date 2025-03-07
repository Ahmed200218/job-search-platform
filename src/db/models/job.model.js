import mongoose, { Schema, model } from "mongoose";
import {Application} from "./application.model.js"

const jobSchema = new Schema(
  {
    jobTitle: { type: String, required: true },
    jobLocation: { type: String, enum: ["onsite", "remote", "hybrid"], required: true },
    workingTime: { type: String, enum: ["part-time", "full-time"], required: true },
    seniorityLevel: {
      type: String,
      enum: ["Fresh", "Junior", "Mid-Level", "Senior", "Team-Lead", "CTO"],
      required: true,
    },
    jobDescription: { type: String, required: true },
    technicalSkills: [{ type: String, required: true }], 
    softSkills: [{ type: String, required: true }], 
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    closed: { type: Boolean, default: false },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  },
  { timestamps: true }
);

jobSchema.virtual("applications", {
  ref: "Application",
  localField: "_id",
  foreignField: "jobId",
});


export const Job = model("Job", jobSchema);
