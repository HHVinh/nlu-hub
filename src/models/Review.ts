import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  reviewerEmail: string; // Người đi đánh giá
  reviewerName: string; // Tên hiển thị của người đánh giá
  sellerEmail: string; // Người bị đánh giá (Tài khoản bán hàng)
  rating: number; // 1 đến 5 sao
  comment: string; // Lời nhận xét
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  reviewerEmail: { type: String, required: true },
  reviewerName: { type: String, required: true },
  sellerEmail: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
