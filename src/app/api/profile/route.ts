import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import UserProfile from "@/models/UserProfile";
import Product from "@/models/Product";
import LostItem from "@/models/LostItem";
import Question from "@/models/Question";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Lấy thông tin Cá nhân và Danh sách Bài đăng
export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const email = session.user.email;

    // 1. Lấy thông tin Hồ sơ
    const profile = await UserProfile.findOne({ email }).lean();

    // 2. Lấy các bài đăng Chợ Sinh Viên
    const products = await Product.find({ authorEmail: email }).sort({ createdAt: -1 }).lean();

    // 3. Lấy các tin Đồ Thất Lạc
    const lostItems = await LostItem.find({ authorEmail: email }).sort({ createdAt: -1 }).lean();

    // 4. Lấy các Câu hỏi Q&A
    const questions = await Question.find({ authorEmail: email }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      profile,
      activities: {
        products,
        lostItems,
        questions
      }
    });
  } catch (error) {
    console.error("Lỗi lấy Profile:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

// Cập nhật thông tin (Số điện thoại)
export async function PUT(request: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const { phoneNumber } = await request.json();

    if (!phoneNumber || !/^[0-9]{10,11}$/.test(phoneNumber)) {
      return NextResponse.json({ success: false, message: "Số điện thoại không hợp lệ. Phải từ 10-11 số." }, { status: 400 });
    }

    const profile = await UserProfile.findOneAndUpdate(
      { email: session.user.email },
      { phoneNumber },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, message: "Cập nhật thành công", profile });
  } catch (error) {
    console.error("Lỗi cập nhật Profile:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
