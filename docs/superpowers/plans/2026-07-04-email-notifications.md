# Hướng 1: Email Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho phép sinh viên đăng ký nhận thông báo qua Email khi có tài liệu mới được tải lên một Môn học cụ thể.

**Architecture:** Tạo collection `Subscription` lưu trữ cặp `{ email, subjectId }`. Xây dựng nút Đăng ký (SubscribeButton) trên trang Môn học. Khi API `/api/documents` nhận file upload thành công, kích hoạt thư viện `nodemailer` gửi email hàng loạt tới các địa chỉ đã đăng ký của môn học đó.

**Tech Stack:** Next.js API Routes, Mongoose, Nodemailer, React Client Components.

---

### Task 1: Thiết lập Database Schema & Mailer Utility

**Files:**
- Create: `src/models/Subscription.ts`
- Create: `src/lib/mailer.ts`

- [ ] **Step 1: Write Subscription Schema**

```typescript
// src/models/Subscription.ts
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

// Chống đăng ký trùng 1 email cho cùng 1 môn
SubscriptionSchema.index({ email: 1, subjectId: 1 }, { unique: true });

export default mongoose.models.Subscription || mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
```

- [ ] **Step 2: Cài đặt Nodemailer**

Run: `npm install nodemailer`
Run: `npm install -D @types/nodemailer`
Expected: PASS

- [ ] **Step 3: Viết tiện ích Mailer**

```typescript
// src/lib/mailer.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // App Password
  },
});

export const sendNewDocumentNotification = async (emails: string[], subjectName: string, docTitle: string, docUrl: string) => {
  if (emails.length === 0) return;
  
  const mailOptions = {
    from: `"NLU Hub" <${process.env.GMAIL_USER}>`,
    bcc: emails, // Gửi BCC để bảo mật danh sách email
    subject: `[NLU Hub] Tài liệu mới cho môn ${subjectName}`,
    html: `
      <h2>Xin chào,</h2>
      <p>Môn học <strong>${subjectName}</strong> mà bạn đang theo dõi vừa có tài liệu mới:</p>
      <h3>${docTitle}</h3>
      <a href="${docUrl}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:5px;">Xem tài liệu ngay</a>
      <p>Cảm ơn bạn đã sử dụng NLU Hub!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
```

- [ ] **Step 4: Commit**

```bash
git add src/models/Subscription.ts src/lib/mailer.ts package.json package-lock.json
git commit -m "feat: add subscription schema and mailer utility"
```

### Task 2: Xây dựng API Quản lý Đăng ký (Subscribe API)

**Files:**
- Create: `src/app/api/subscriptions/route.ts`

- [ ] **Step 1: Write Subscription API**

```typescript
// src/app/api/subscriptions/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Subscription from "@/models/Subscription";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, subjectId } = await request.json();

    if (!email || !subjectId) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin" }, { status: 400 });
    }

    const newSub = new Subscription({ email, subjectId });
    await newSub.save();

    return NextResponse.json({ success: true, message: "Đăng ký thành công!" });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: "Email này đã đăng ký rồi!" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Lỗi Server" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/subscriptions/route.ts
git commit -m "feat: add subscription POST api"
```

### Task 3: Xây dựng Giao diện Đăng ký (Subscribe UI)

**Files:**
- Create: `src/app/subject/[subjectId]/SubscribeButtonClient.tsx`
- Modify: `src/app/subject/[subjectId]/page.tsx`

- [ ] **Step 1: Write SubscribeButtonClient**

```tsx
// src/app/subject/[subjectId]/SubscribeButtonClient.tsx
"use client";

import { useState } from "react";

export default function SubscribeButtonClient({ subjectId, defaultEmail = "" }: { subjectId: string, defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subjectId })
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) setIsOpen(false);
    } catch {
      alert("Lỗi kết nối");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="py-2 px-4 bg-teal-100 text-teal-700 font-bold rounded-xl hover:bg-teal-200 transition-all flex items-center gap-2">
        🔔 Nhận Thông Báo
      </button>
      
      {isOpen && (
        <form onSubmit={handleSubscribe} className="absolute top-full mt-2 right-0 w-72 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xl border border-slate-200 z-50">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Nhận email ngay khi có tài liệu mới được tải lên môn này.</p>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Nhập Email của bạn..." 
            required 
            className="w-full px-3 py-2 border rounded-lg mb-3 bg-slate-50 dark:bg-slate-800"
          />
          <button type="submit" disabled={isLoading} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold">
            {isLoading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Nhúng vào Subject Page**

Modify `src/app/subject/[subjectId]/page.tsx` ở chỗ Header Môn học, thêm `<SubscribeButtonClient subjectId={subjectId} defaultEmail={session?.user?.email} />` kế bên các nút chức năng.

- [ ] **Step 3: Commit**

```bash
git add src/app/subject/[subjectId]/SubscribeButtonClient.tsx src/app/subject/[subjectId]/page.tsx
git commit -m "feat: add subscribe button UI to subject page"
```

### Task 4: Kích hoạt Gửi Email khi Tải Tài Liệu Lên

**Files:**
- Modify: `src/app/api/documents/route.ts`

- [ ] **Step 1: Update Document API**

Trong hàm `POST` của `route.ts`, sau khi `newDoc.save()` thành công, thêm đoạn code:
```typescript
    // Gửi email thông báo
    try {
      const subject = await Subject.findById(body.subjectId);
      const subs = await Subscription.find({ subjectId: body.subjectId });
      const emails = subs.map(sub => sub.email);
      
      if (emails.length > 0 && subject) {
        // Lưu ý: Không dùng await ở đây để tránh làm chậm response của người up file
        sendNewDocumentNotification(emails, subject.name, body.title, `http://localhost:3000/subject/${subject._id}`);
      }
    } catch (err) {
      console.error("Lỗi gửi email:", err);
    }
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/documents/route.ts
git commit -m "feat: trigger email notification on new document upload"
```
