import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Document from "@/models/Document";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập" }, { status: 401 });
    }

    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ success: false, message: "Tên tài liệu không được để trống" }, { status: 400 });
    }

    const doc = await Document.findById(id);
    if (!doc) {
      return NextResponse.json({ success: false, message: "Không tìm thấy tài liệu" }, { status: 404 });
    }

    // Phân quyền (Authorization)
    const isOwner = session.user.email === doc.uploaderEmail;
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL;
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, message: "Bạn không có quyền sửa tài liệu này" }, { status: 403 });
    }

    doc.title = body.title;
    await doc.save();

    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi hệ thống khi sửa tài liệu" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập" }, { status: 401 });
    }

    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const doc = await Document.findById(id);
    if (!doc) {
      return NextResponse.json({ success: false, message: "Không tìm thấy tài liệu để xóa" }, { status: 404 });
    }

    // Phân quyền (Authorization)
    const isOwner = session.user.email === doc.uploaderEmail;
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL;
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, message: "Bạn không có quyền xóa tài liệu này" }, { status: 403 });
    }

    await Document.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Xóa tài liệu thành công trên Web" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi hệ thống khi xóa" }, { status: 500 });
  }
}
