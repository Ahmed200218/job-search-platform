import mongoose, { Schema, model } from "mongoose";

const applicationSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userCV: { 
      secure_url: { type: String, required: true }, 
      public_id: { type: String, required: true } 
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "viewed", "in consideration", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Application = model("Application", applicationSchema);

