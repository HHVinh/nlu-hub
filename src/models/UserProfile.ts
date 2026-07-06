import mongoose, { Schema, Document } from "mongoose";

export interface IUserProfile extends Document {
  email: string; // Khóa chính liên kết với Google Auth
  name: string;
  phoneNumber: string; // Bắt buộc phải có để đăng bán đồ
  isBanned: boolean; // Trạng thái cấm do lừa đảo
  averageRating: number; // Điểm đánh giá trung bình (1-5)
  totalReviews: number; // Tổng số lượt đánh giá
  createdAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phoneNumber: { type: String, default: "" },
  isBanned: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.UserProfile || mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);
