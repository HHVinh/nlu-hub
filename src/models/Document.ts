import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IDoc extends MongooseDocument {
  title: string;
  subjectId: mongoose.Types.ObjectId;
  uploaderEmail: string; // Lưu email người đăng
  uploaderName: string;  // Lưu tên người đăng
  url: string;           // Link Google Drive hoặc Link Cloudinary
  type: "pdf" | "word" | "excel" | "link" | "image" | "zip" | "drive"; // Phân loại tài liệu
  downloads: number;
  createdAt: Date;
}

const DocumentSchema = new Schema<IDoc>({
  title: { type: String, required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  uploaderEmail: { type: String, required: true },
  uploaderName: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ["pdf", "word", "excel", "link", "image", "zip", "drive"], default: "link" },
  downloads: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Document || mongoose.model<IDoc>("Document", DocumentSchema);
