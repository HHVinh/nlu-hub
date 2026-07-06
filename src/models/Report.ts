import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  reporterEmail: string; // Người đi tố cáo
  accusedEmail: string; // Người bị tố cáo (Tài khoản bán hàng)
  productUrl: string; // Đường dẫn món đồ bị report
  reason: string; // Lý do báo cáo
  description: string; // Mô tả chi tiết
  status: "Chờ xử lý" | "Đã giải quyết" | "Từ chối"; // Trạng thái xử lý của Admin
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>({
  reporterEmail: { type: String, required: true },
  accusedEmail: { type: String, required: true },
  productUrl: { type: String, required: true },
  reason: { 
    type: String, 
    required: true,
    enum: ["Lừa đảo / Gian lận", "Hàng giả / Kém chất lượng", "Số điện thoại ảo", "Bán hàng cấm", "Khác"] 
  },
  description: { type: String, required: true },
  status: { type: String, default: "Chờ xử lý" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);
