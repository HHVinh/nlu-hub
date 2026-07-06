import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Document from "@/models/Document";
import Subject from "@/models/Subject";
import Subscription from "@/models/Subscription";
import { sendNewDocumentNotification } from "@/lib/mailer";
import { getServerSession } from "next-auth/next";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    if (!subjectId) {
      return NextResponse.json({ success: false, message: "Thiếu mã môn học" }, { status: 400 });
    }

    // Sắp xếp mới nhất lên đầu (createdAt: -1) và dùng .lean() để tối ưu bộ nhớ
    const documents = await Document.find({ subjectId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, subjectId, url, fileType } = body;
    const session = await getServerSession();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập để đóng góp tài liệu!" }, { status: 401 });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return NextResponse.json({ success: false, message: "Môn học không tồn tại" }, { status: 404 });
    }

    if (!title || !subjectId || !url) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Rate Limit: Tối đa 20 tài liệu/ngày
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const docCount = await Document.countDocuments({ 
      uploaderEmail: userEmail,
      createdAt: { $gte: oneDayAgo }
    });
    
    if (docCount >= 20) {
      return NextResponse.json({ success: false, message: "Bạn đã đạt giới hạn tải lên 20 tài liệu trong 24h. Vui lòng quay lại sau!" }, { status: 429 });
    }

    const newDocument = new Document({
      title: title.trim(),
      url: url.trim(),
      type: fileType || "link",
      subjectId: subject._id,
      uploaderName: userEmail ? session?.user?.name || "Sinh viên" : "Ẩn danh",
      uploaderEmail: userEmail,
    });

    await newDocument.save();

    // ---- GỬI EMAIL THÔNG BÁO CHO NHỮNG NGƯỜI ĐÃ ĐĂNG KÝ ----
    try {
      // Tìm tất cả những ai đã đăng ký môn này
      const subscriptions = await Subscription.find({ subjectId: subject._id });
      const emails = subscriptions.map((sub: any) => sub.email);

      if (emails.length > 0) {
        const docUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/subject/${subject._id}`;
        // Không dùng 'await' ở đây để không làm chậm quá trình Upload của sinh viên
        sendNewDocumentNotification(emails, subject.name, newDocument.title, docUrl);
      }
    } catch (mailError) {
      console.error("Lỗi khi gửi email tự động:", mailError);
    }
    // -------------------------------------------------------

    return NextResponse.json({
      success: true,
      message: "Tải tài liệu lên thành công!",
      document: newDocument,
    });
  } catch (error) {
    console.error("Lỗi POST Document:", error);
    return NextResponse.json({ success: false, message: "Lỗi lưu tài liệu" }, { status: 500 });
  }
}
