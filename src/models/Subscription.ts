import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
  email: string;
  subjectId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  email: { type: String, required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  createdAt: { type: Date, default: Date.now },
});

// Chống đăng ký trùng: 1 Email không thể đăng ký 2 lần cho CÙNG 1 môn học
SubscriptionSchema.index({ email: 1, subjectId: 1 }, { unique: true });

export default mongoose.models.Subscription || mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
