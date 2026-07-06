import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import UserProfile from "@/models/UserProfile";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request: Request, { params }: { params: Promise<{ email: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    // CHỐT CHẶN BẢO MẬT BACKEND
    if (!session || !session.user || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ success: false, message: "403 Forbidden - Không có quyền truy cập" }, { status: 403 });
    }

    const { email } = await params;
    const body = await request.json();
    const { isBanned } = body;

    await connectDB();

    // Không cho phép Admin tự khóa chính mình
    if (email === process.env.ADMIN_EMAIL) {
      return NextResponse.json({ success: false, message: "Không thể khóa tài khoản Admin!" }, { status: 400 });
    }

    const user = await UserProfile.findOneAndUpdate(
      { email: email },
      { isBanned: isBanned },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ success: false, message: "Không tìm thấy tài khoản" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: isBanned ? `Đã khóa tài khoản ${email}` : `Đã mở khóa tài khoản ${email}`
    });

  } catch (error: any) {
    console.error("Admin Ban User Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
