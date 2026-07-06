import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 1. Cập nhật trạng thái "Đã bán"
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập!" }, { status: 401 });
    }

    const { id } = await params;
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json({ success: false, message: "Không tìm thấy món đồ" }, { status: 404 });
    }

    // Chỉ tác giả mới được cập nhật trạng thái
    if (product.authorEmail !== session.user.email) {
      return NextResponse.json({ success: false, message: "Bạn không có quyền sửa trạng thái món đồ này." }, { status: 403 });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { status: "Đã bán" },
      { new: true }
    );

    return NextResponse.json({ success: true, message: "Đã đánh dấu Đã Bán!", data: updatedProduct });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}

// 2. Xóa món đồ (Kèm phân quyền)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập!" }, { status: 401 });
    }

    const { id } = await params;
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json({ success: false, message: "Không tìm thấy món đồ" }, { status: 404 });
    }

    // Phân quyền 2 lớp
    const userEmail = session.user.email;
    const isAdmin = userEmail === process.env.ADMIN_EMAIL;
    const isAuthor = userEmail === product.authorEmail;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ success: false, message: "Cấm truy cập! Bạn không có quyền xóa." }, { status: 403 });
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Xóa bài viết thành công!" });
  } catch (error) {
    console.error("Lỗi Xóa Sản phẩm:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}
