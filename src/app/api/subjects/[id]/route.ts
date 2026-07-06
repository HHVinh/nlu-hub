import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Subject from "@/models/Subject";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ success: false, message: "Tên môn không được để trống" }, { status: 400 });
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { name: body.name, note: body.note || "" },
      { new: true } // Trả về data mới sau khi update
    );

    if (!updatedSubject) {
      return NextResponse.json({ success: false, message: "Không tìm thấy môn học" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedSubject });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi hệ thống khi sửa" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // TODO: Sau này cần kiểm tra xem môn học này có Tài liệu nào bên trong không.
    // Nếu có tài liệu thì chặn không cho xóa (tránh lỗi mồ côi data).
    
    const deletedSubject = await Subject.findByIdAndDelete(id);

    if (!deletedSubject) {
      return NextResponse.json({ success: false, message: "Không tìm thấy môn học để xóa" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi hệ thống khi xóa" }, { status: 500 });
  }
}
