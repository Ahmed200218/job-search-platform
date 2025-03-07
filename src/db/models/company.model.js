import mongoose, { Schema, model } from "mongoose";
import { Job } from "./job.model.js";

const companySchema = new Schema(
    {
        companyName: { type: String, unique: true, required: true },
        description: { type: String, required: true },
        industry: { type: String, required: true },
        address: { type: String, required: true },
        numberOfEmployees: {
            type: String,
            enum: ["1-10", "11-20", "21-50", "51-100", "101-500", "500+"],
            required: true,
        },
        companyEmail: { type: String, unique: true, required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        logo: { secure_url: { type: String, default: "" }, public_id: { type: String, default: "" } },
        coverPic: { secure_url: { type: String, default: "" }, public_id: { type: String, default: "" } },
        HRs: [{ type: Schema.Types.ObjectId, ref: "User" }],
        bannedAt: { type: Date, default: null },
        deletedAt: { type: Date, default: null },
        legalAttachment: { secure_url: { type: String, default: "" }, public_id: { type: String, default: "" } },
        approvedByAdmin: { type: Boolean, default: false },
    },
    { timestamps: true }
);

companySchema.virtual("jobs", {
    ref: "Job",
    localField: "_id",
    foreignField: "companyId",
    justOne: false,
});

companySchema.set("toJSON", { virtuals: true });
companySchema.set("toObject", { virtuals: true });

export const Company = model("Company", companySchema);
