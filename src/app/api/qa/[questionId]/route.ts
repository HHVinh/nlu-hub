import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Question from "@/models/Question";
import Answer from "@/models/Answer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendNewAnswerNotification } from "@/lib/mailer";

// 1. Lấy chi tiết Câu hỏi và Danh sách Câu trả lời
export async function GET(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    await connectDB();
    const { questionId } = await params;

    // Tăng lượt xem (views) lên 1 mỗi khi có người mở xem
    const question = await Question.findByIdAndUpdate(
      questionId,
      { $inc: { views: 1 } },
      { new: true } // Trả về data mới nhất sau khi tăng
    );

    if (!question) {
      return NextResponse.json({ success: false, message: "Không tìm thấy câu hỏi" }, { status: 404 });
    }

    // Lấy tất cả câu trả lời của câu hỏi này
    const answers = await Answer.find({ questionId }).sort({ createdAt: 1 }).lean(); // Xếp cũ nhất lên trước (Giống comment Facebook)

    return NextResponse.json({ 
      success: true, 
      data: { question, answers } 
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết câu hỏi:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}

// 2. Đăng câu trả lời mới
export async function POST(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập để trả lời!" }, { status: 401 });
    }

    const { questionId } = await params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ success: false, message: "Nội dung trả lời không được trống!" }, { status: 400 });
    }

    const userEmail = session.user.email;

    const newAnswer = await Answer.create({
      questionId,
      content,
      authorName: session.user.name || "Sinh viên Ẩn danh",
      authorEmail: userEmail,
    });

    // ---- GỬI EMAIL THÔNG BÁO CHO TÁC GIẢ VÀ NGƯỜI THEO DÕI ----
    try {
      const question = await Question.findById(questionId);
      if (question) {
        const questionUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/qa/${questionId}`;
        
        // 1. Gửi cho tác giả (nếu người đang trả lời KHÔNG PHẢI là tác giả)
        if (question.authorEmail !== userEmail) {
          await sendNewAnswerNotification(question.authorEmail, question.title, newAnswer.authorName, questionUrl);
        }
        
        // 2. Gửi cho những người đang "Hóng" (followers)
        if (question.followers && question.followers.length > 0) {
          // Lọc ra danh sách gửi: Bỏ người đang trả lời và Tác giả gốc (tác giả gốc đã nhận ở trên rồi)
          const followersToEmail = question.followers.filter(
            (email: string) => email !== userEmail && email !== question.authorEmail
          );
          
          // Gửi hàng loạt
          for (const followerEmail of followersToEmail) {
             // Chú ý: Dùng vòng lặp for...of không có await nếu muốn gửi nhanh, nhưng để chắc chắn ta cứ dùng await hoặc Promise.all
             sendNewAnswerNotification(followerEmail, question.title, newAnswer.authorName, questionUrl).catch(e => console.error(e));
          }
        }
      }
    } catch (mailError) {
      console.error("Lỗi khi gửi email báo có câu trả lời:", mailError);
    }
    // -------------------------------------------------

    return NextResponse.json({ success: true, message: "Đăng câu trả lời thành công!", data: newAnswer }, { status: 201 });
  } catch (error) {
    console.error("Lỗi đăng Câu trả lời:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}

// 3. Đăng ký / Hủy đăng ký Theo dõi Câu hỏi (Follow/Unfollow)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập!" }, { status: 401 });
    }

    const { questionId } = await params;
    const userEmail = session.user.email;
    const question = await Question.findById(questionId);
    
    if (!question) {
      return NextResponse.json({ success: false, message: "Không tìm thấy câu hỏi" }, { status: 404 });
    }

    const followersArray = question.followers || [];
    const isFollowing = followersArray.includes(userEmail);

    if (isFollowing) {
      // Hủy theo dõi: Xóa email khỏi mảng
      await Question.findByIdAndUpdate(questionId, { $pull: { followers: userEmail } });
      return NextResponse.json({ success: true, isFollowing: false, message: "Đã hủy theo dõi câu hỏi này." });
    } else {
      // Theo dõi: Thêm email vào mảng
      await Question.findByIdAndUpdate(questionId, { $addToSet: { followers: userEmail } });
      return NextResponse.json({ success: true, isFollowing: true, message: "Bạn sẽ nhận được email khi có câu trả lời mới!" });
    }
  } catch (error) {
    console.error("Lỗi Đăng ký theo dõi:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}

// 4. Xóa Câu hỏi (Kèm phân quyền)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập!" }, { status: 401 });
    }

    const { questionId } = await params;
    const question = await Question.findById(questionId);
    
    if (!question) {
      return NextResponse.json({ success: false, message: "Không tìm thấy câu hỏi" }, { status: 404 });
    }

    // Cơ chế phân quyền 2 lớp
    const userEmail = session.user.email;
    const isAdmin = userEmail === process.env.ADMIN_EMAIL;
    const isAuthor = userEmail === question.authorEmail;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ success: false, message: "Cấm truy cập! Bạn không có quyền xóa bài viết này." }, { status: 403 });
    }

    // Xóa câu hỏi
    await Question.findByIdAndDelete(questionId);
    // Dọn dẹp: Xóa luôn tất cả câu trả lời thuộc về câu hỏi này để tránh rác database
    await Answer.deleteMany({ questionId });

    return NextResponse.json({ success: true, message: "Xóa bài viết thành công!" });
  } catch (error) {
    console.error("Lỗi Xóa Câu hỏi:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}
