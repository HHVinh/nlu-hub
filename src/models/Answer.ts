import mongoose, { Schema, Document } from "mongoose";

export interface IAnswer extends Document {
  questionId: mongoose.Types.ObjectId; // Trỏ về Câu hỏi gốc
  content: string;
  authorName: string;
  authorEmail: string;
  isAccepted: boolean; // Được người hỏi đánh dấu "Câu trả lời hay nhất" hay không
  likes: number; // Lượt Thích / Upvote
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    content: { type: String, required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    isAccepted: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Answer || mongoose.model<IAnswer>("Answer", AnswerSchema);
