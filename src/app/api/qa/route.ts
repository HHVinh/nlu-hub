import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Question from "@/models/Question";
import Answer from "@/models/Answer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    await connectDB();
    
    // Kỹ thuật Aggregation (Gộp dữ liệu nâng cao)
    // Để lấy ra danh sách Câu hỏi + Đếm xem mỗi câu có bao nhiêu Câu trả lời
    const questions = await Question.aggregate([
      {
        $lookup: {
          from: "answers", // Tên bảng trong MongoDB luôn ở dạng số nhiều viết thường
          localField: "_id",
          foreignField: "questionId",
          as: "answersData"
        }
      },
      {
        $addFields: {
          answerCount: { $size: "$answersData" }
        }
      },
      {
        $project: {
          answersData: 0 // Giấu mảng nội dung trả lời đi cho nhẹ API, chỉ giữ lại con số đếm
        }
      },
      { $sort: { createdAt: -1 } } // Sắp xếp mới nhất lên đầu
    ]);

    return NextResponse.json({ success: true, data: questions });
  } catch (error) {
    console.error("Lỗi lấy danh sách Câu hỏi:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập để đặt câu hỏi!" }, { status: 401 });
    }

    // Rate Limit: Tối đa 5 câu hỏi/ngày
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const postCount = await Question.countDocuments({ 
      authorEmail: session.user?.email,
      createdAt: { $gte: oneDayAgo }
    });
    if (postCount >= 5) {
      return NextResponse.json({ success: false, message: "Bạn đã đạt giới hạn 5 câu hỏi trong 24h. Vui lòng quay lại sau!" }, { status: 429 });
    }

    const { title, content, tags } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ success: false, message: "Tiêu đề và nội dung không được để trống!" }, { status: 400 });
    }

    const newQuestion = await Question.create({
      title,
      content,
      tags: tags || [],
      authorName: session.user?.name || "Sinh viên Ẩn danh",
      authorEmail: session.user?.email,
    });

    return NextResponse.json({ success: true, message: "Đăng câu hỏi thành công!", data: newQuestion }, { status: 201 });
  } catch (error) {
    console.error("Lỗi đăng Câu hỏi:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}
