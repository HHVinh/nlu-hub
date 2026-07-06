import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Answer from "@/models/Answer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ questionId: string, answerId: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập!" }, { status: 401 });
    }

    const { answerId } = await params;
    const answer = await Answer.findById(answerId);
    
    if (!answer) {
      return NextResponse.json({ success: false, message: "Không tìm thấy câu trả lời" }, { status: 404 });
    }

    // Cơ chế phân quyền 2 lớp
    const userEmail = session.user?.email;
    const isAdmin = userEmail === process.env.ADMIN_EMAIL;
    const isAuthor = userEmail === answer.authorEmail;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ success: false, message: "Cấm truy cập! Bạn không có quyền xóa." }, { status: 403 });
    }

    await Answer.findByIdAndDelete(answerId);

    return NextResponse.json({ success: true, message: "Đã xóa câu trả lời!" });
  } catch (error) {
    console.error("Lỗi Xóa Câu trả lời:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}
