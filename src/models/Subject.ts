import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface ISubject extends MongooseDocument {
  name: string;
  note?: string; // Ghi chú (không bắt buộc)
  faculty: string;
  createdAt: Date;
}

const SubjectSchema = new Schema<ISubject>({
  name: { type: String, required: true },
  note: { type: String },
  faculty: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Subject || mongoose.model<ISubject>("Subject", SubjectSchema);
