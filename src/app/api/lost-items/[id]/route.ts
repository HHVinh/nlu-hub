import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LostItem from "@/models/LostItem";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập!" }, { status: 401 });
    }

    const { id } = await props.params;

    const item = await LostItem.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, message: "Không tìm thấy món đồ!" }, { status: 404 });
    }

    if (item.authorEmail !== session.user.email) {
      return NextResponse.json({ success: false, message: "Bạn không có quyền thực hiện thao tác này!" }, { status: 403 });
    }

    item.status = "Đã giải quyết xong";
    await item.save();

    return NextResponse.json({ success: true, message: "Cập nhật trạng thái thành công!" });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái đồ thất lạc:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập!" }, { status: 401 });
    }

    const { id } = await props.params;
    const item = await LostItem.findById(id);
    
    if (!item) {
      return NextResponse.json({ success: false, message: "Không tìm thấy món đồ!" }, { status: 404 });
    }

    const userEmail = session.user.email;
    const isAdmin = userEmail === process.env.ADMIN_EMAIL;
    const isAuthor = userEmail === item.authorEmail;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ success: false, message: "Bạn không có quyền xóa bài viết này!" }, { status: 403 });
    }

    await LostItem.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Xóa bài viết thành công!" });
  } catch (error) {
    console.error("Lỗi xóa đồ thất lạc:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
