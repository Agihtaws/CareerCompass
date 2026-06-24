import mongoose from "mongoose";

const resumeLayoutSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "Untitled layout" },
    template: { type: String, default: "modern" },
    order: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const ResumeLayout =
  mongoose.models.ResumeLayout ||
  mongoose.model("ResumeLayout", resumeLayoutSchema);