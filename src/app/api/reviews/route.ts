import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import UserProfile from "@/models/UserProfile";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 1. Gửi đánh giá uy tín cho người bán
export async function POST(request: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập!" }, { status: 401 });
    }

    const { sellerEmail, rating, comment } = await request.json();

    if (!sellerEmail || !rating || !comment) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin đánh giá" }, { status: 400 });
    }

    // Không được tự đánh giá chính mình
    if (session.user.email === sellerEmail) {
      return NextResponse.json({ success: false, message: "Bạn không thể tự đánh giá uy tín của chính mình!" }, { status: 400 });
    }

    // Nếu đã đánh giá rồi thì Ghi đè (Sửa lại), nếu chưa thì Tạo mới
    await Review.findOneAndUpdate(
      { reviewerEmail: session.user.email, sellerEmail },
      { 
        reviewerName: session.user.name || "Người dùng ẩn danh",
        rating,
        comment 
      },
      { upsert: true, new: true }
    );

    // Tính toán lại Điểm trung bình cho Người bán
    const allReviews = await Review.find({ sellerEmail });
    const totalReviews = allReviews.length;
    const sumRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = sumRating / totalReviews;

    // Cập nhật Profile Người bán
    await UserProfile.findOneAndUpdate(
      { email: sellerEmail },
      { 
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: "Cảm ơn bạn đã đánh giá uy tín người bán!" });
  } catch (error) {
    console.error("Lỗi đăng review:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
