import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LostItem from "@/models/LostItem";
import UserProfile from "@/models/UserProfile";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const query = searchParams.get("query");

    const filter: any = {};
    if (type && type !== "All") filter.type = type;
    if (category && category !== "All") filter.category = category;
    if (status && status !== "All") filter.status = status;
    
    // Tìm kiếm theo tên
    if (query) {
      filter.$text = { $search: query };
    }

    // Sắp xếp: Mới nhất lên đầu
    const items = await LostItem.find(filter)
      .sort(query ? { score: { $meta: "textScore" } } : { createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Lỗi lấy danh sách Thất lạc:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập!" }, { status: 401 });
    }

    // Kiểm tra SĐT (Bảo mật Anti-Scam)
    const userProfile = await UserProfile.findOne({ email: session.user?.email }).lean();
    if (userProfile?.isBanned) {
      return NextResponse.json({ success: false, message: "Tài khoản của bạn đã bị cấm." }, { status: 403 });
    }
    if (!userProfile?.phoneNumber) {
      return NextResponse.json({ success: false, message: "Yêu cầu cập nhật Số điện thoại trước khi đăng tin để đảm bảo an toàn." }, { status: 403 });
    }

    // Rate Limit: Tối đa 5 bài/ngày
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const postCount = await LostItem.countDocuments({ 
      authorEmail: session.user?.email,
      createdAt: { $gte: oneDayAgo }
    });
    if (postCount >= 5) {
      return NextResponse.json({ success: false, message: "Bạn đã đạt giới hạn đăng 5 bài Tìm Đồ/Trả Đồ trong 24 giờ qua. Vui lòng thử lại vào ngày mai!" }, { status: 429 });
    }

    const { type, title, description, category, imageUrl, contactInfo } = await request.json();

    if (!type || !title || !description || !category || !contactInfo) {
      return NextResponse.json({ success: false, message: "Vui lòng điền đầy đủ thông tin bắt buộc." }, { status: 400 });
    }

    const newItem = await LostItem.create({
      type,
      title,
      description,
      category,
      imageUrl,
      contactInfo,
      authorEmail: session.user?.email,
      authorName: session.user?.name || "Sinh viên",
    });

    return NextResponse.json({ success: true, message: "Đăng tin thành công!", item: newItem });
  } catch (error) {
    console.error("Lỗi đăng tin Thất lạc:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
