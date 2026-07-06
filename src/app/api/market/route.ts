import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 1. Lấy danh sách Sản phẩm (Chợ Sinh Viên)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isFree = searchParams.get("isFree"); // "true" hoặc "false"

    await connectDB();
    
    // Xây dựng bộ lọc (Filter)
    const filter: any = {};
    if (category && category !== "All") {
      filter.category = category;
    }
    if (isFree === "true") {
      filter.price = 0;
    }

    // Lấy dữ liệu và Sắp xếp: Món đồ "Đang bán" (chữ a) < "Đã bán" (chữ ã).
    // Do đó sort 1 (tăng dần) sẽ đẩy "Đang bán" lên trước.
    const products = await Product.find(filter)
      .sort({ status: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Lỗi lấy danh sách sản phẩm:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}

// 2. Đăng Sản phẩm mới
export async function POST(request: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập để đăng bán!" }, { status: 401 });
    }

    // Rate Limit: Tối đa 15 món đồ/ngày
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const postCount = await Product.countDocuments({ 
      authorEmail: session.user.email,
      createdAt: { $gte: oneDayAgo }
    });
    if (postCount >= 15) {
      return NextResponse.json({ success: false, message: "Bạn đã đạt giới hạn đăng 15 món đồ trong 24h. Vui lòng quay lại sau!" }, { status: 429 });
    }

    const data = await request.json();
    
    // Validate dữ liệu cơ bản
    if (!data.title || !data.description || !data.category || !data.condition || !data.contactInfo) {
      return NextResponse.json({ success: false, message: "Vui lòng điền đầy đủ thông tin bắt buộc!" }, { status: 400 });
    }

    // Giá mặc định là 0 nếu không nhập
    const priceValue = data.price ? Number(data.price) : 0;

    const newProduct = await Product.create({
      ...data,
      price: priceValue,
      authorName: session.user.name || "Người dùng ẩn danh",
      authorEmail: session.user.email,
    });

    return NextResponse.json({ success: true, message: "Đăng tin thành công!", data: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Lỗi đăng sản phẩm:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}
