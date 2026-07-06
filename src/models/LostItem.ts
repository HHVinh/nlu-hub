import mongoose, { Schema, Document } from "mongoose";

export interface ILostItem extends Document {
  type: "Lost" | "Found"; // Tìm đồ (Lost) hay Nhặt được đồ (Found)
  title: string;
  description: string;
  category: "Giấy tờ tùy thân" | "Bóp/Ví" | "Chìa khóa" | "Đồ điện tử" | "Khác";
  imageUrl?: string;
  contactInfo: string;
  status: "Chưa giải quyết" | "Đã giải quyết xong";
  authorEmail: string;
  authorName: string;
  createdAt: Date;
}

const LostItemSchema = new Schema<ILostItem>({
  type: { type: String, required: true, enum: ["Lost", "Found"] },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ["Giấy tờ tùy thân", "Bóp/Ví", "Chìa khóa", "Đồ điện tử", "Khác"] 
  },
  imageUrl: { type: String, default: "" },
  contactInfo: { type: String, required: true },
  status: { type: String, default: "Chưa giải quyết", enum: ["Chưa giải quyết", "Đã giải quyết xong"] },
  authorEmail: { type: String, required: true },
  authorName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Full-text search index
LostItemSchema.index({ title: "text", description: "text" });

// Auto-delete sau 30 ngày (2592000 giây)
LostItemSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// Xóa cache model cũ để tránh lỗi ValidationError khi đổi Schema (Next.js HMR)
delete mongoose.models.LostItem;

export default mongoose.model<ILostItem>("LostItem", LostItemSchema);
