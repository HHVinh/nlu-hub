import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Subscription from "@/models/Subscription";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Vui lòng đăng nhập để đăng ký nhận thông báo!" },
        { status: 401 }
      );
    }

    const email = session.user?.email;
    const body = await request.json();
    const { subjectId } = body;

    if (!subjectId) {
      return NextResponse.json(
        { success: false, message: "Vui lòng cung cấp mã môn học" },
        { status: 400 }
      );
    }

    const newSubscription = new Subscription({ email, subjectId });
    await newSubscription.save();

    return NextResponse.json({ 
      success: true, 
      message: "Đăng ký nhận thông báo thành công!" 
    });

  } catch (error: any) {
    console.error("Lỗi đăng ký:", error);
    
    // Lỗi 11000 là mã lỗi của MongoDB khi bị trùng lặp dữ liệu (Unique Index Constraint)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Email này đã đăng ký nhận thông báo cho môn này rồi!" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi đăng ký thông báo" },
      { status: 500 }
    );
  }
}
