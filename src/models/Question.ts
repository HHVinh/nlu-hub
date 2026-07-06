import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  title: string;
  content: string;
  authorName: string;
  authorEmail: string;
  tags: string[]; // Lưu mảng các từ khóa (ví dụ: ["Đại cương", "Tín chỉ"])
  followers: string[]; // Danh sách Email những người muốn nhận thông báo khi có câu trả lời mới
  views: number;
  likes: number; // Tạm thời để sẵn trường này cho tính năng Upvote sau này
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    tags: { type: [String], default: [] },
    followers: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true } // Tự động quản lý createdAt và updatedAt
);

// Tạo Index (Mục lục) để Tìm kiếm văn bản siêu tốc độ (Tích hợp cho Global Search sau này)
QuestionSchema.index({ title: "text", content: "text", tags: "text" });

export default mongoose.models.Question || mongoose.model<IQuestion>("Question", QuestionSchema);
