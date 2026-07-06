import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number; // 0 nghĩa là cho tặng miễn phí
  imageUrl: string; // Link ảnh do người dùng cung cấp hoặc URL ảnh mặc định
  category: string;
  condition: string;
  status: "Đang bán" | "Đã bán"; // Trạng thái của món đồ
  contactInfo: string; // Link FB, Zalo, SĐT
  authorName: string;
  authorEmail: string;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  imageUrl: { type: String, default: "" },
  category: { 
    type: String, 
    required: true,
    enum: ["Giáo trình", "Đồ điện tử", "Đồ dùng học tập", "Phương tiện", "Phòng trọ", "Khác"]
  },
  condition: { 
    type: String, 
    required: true,
    enum: ["Mới 100%", "Như mới", "Đã sử dụng", "Cũ"]
  },
  status: { 
    type: String, 
    required: true, 
    enum: ["Đang bán", "Đã bán"],
    default: "Đang bán" 
  },
  contactInfo: { type: String, required: true },
  authorName: { type: String, required: true },
  authorEmail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
