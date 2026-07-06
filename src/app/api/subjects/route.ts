import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Subject from "@/models/Subject";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const faculty = searchParams.get("faculty");

    // Nếu có truyền faculty thì lọc theo khoa, không thì lấy hết
    const query = faculty ? { faculty } : {};
    
    // Sắp xếp môn học theo bảng chữ cái A-Z (name: 1)
    const subjects = await Subject.find(query).sort({ name: 1 }).lean();

    return NextResponse.json({ success: true, data: subjects });
  } catch (error) {
    console.error("Lỗi GET Subjects:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy danh sách môn học" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    if (!body.name || !body.faculty) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập tên môn và mã khoa" },
        { status: 400 }
      );
    }

    // Kiểm tra xem môn học đã tồn tại chưa để tránh trùng lặp rác
    const existingSubject = await Subject.findOne({ 
      name: { $regex: new RegExp(`^${body.name}$`, 'i') }, 
      faculty: body.faculty 
    });

    if (existingSubject) {
      return NextResponse.json(
        { success: false, message: "Môn học này đã có trong danh sách rồi!" },
        { status: 409 }
      );
    }

    const newSubject = await Subject.create({
      name: body.name,
      note: body.note || "",
      faculty: body.faculty,
    });

    return NextResponse.json({ success: true, data: newSubject }, { status: 201 });
  } catch (error) {
    console.error("Lỗi POST Subject:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi tạo môn học mới" },
      { status: 500 }
    );
  }
}
