import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Report from "@/models/Report";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendMail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập!" }, { status: 401 });
    }

    const { accusedEmail, productUrl, reason, description } = await request.json();

    if (!accusedEmail || !reason || !description) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin báo cáo" }, { status: 400 });
    }

    // Không được tự báo cáo chính mình
    if (session.user.email === accusedEmail) {
      return NextResponse.json({ success: false, message: "Bạn không thể tự báo cáo chính mình!" }, { status: 400 });
    }

    // Rate Limit: Tối đa 3 lần báo cáo/ngày
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const reportCount = await Report.countDocuments({ 
      reporterEmail: session.user.email,
      createdAt: { $gte: oneDayAgo }
    });
    
    if (reportCount >= 3) {
      return NextResponse.json({ success: false, message: "Bạn đã đạt giới hạn 3 lần báo cáo trong 24h. Vui lòng quay lại sau!" }, { status: 429 });
    }

    // Lưu Báo cáo vào DB
    await Report.create({
      reporterEmail: session.user.email,
      accusedEmail,
      productUrl,
      reason,
      description
    });

    // Gửi Email Khẩn cấp cho Admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 2px solid #ef4444; border-radius: 10px;">
          <h2 style="color: #ef4444;">🚨 CẢNH BÁO LỪA ĐẢO TỪ NLU HUB</h2>
          <p>Hệ thống vừa ghi nhận một lượt Tố cáo (Report) mới. Vui lòng kiểm tra ngay!</p>
          <ul style="background-color: #fef2f2; padding: 15px 15px 15px 30px; border-radius: 8px;">
            <li><b>Lý do:</b> ${reason}</li>
            <li><b>Kẻ bị tố cáo (Seller):</b> ${accusedEmail}</li>
            <li><b>Người đi tố cáo:</b> ${session.user.email}</li>
            <li><b>Link món đồ:</b> <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${productUrl}">Xem món đồ</a></li>
          </ul>
          <p><b>Chi tiết bằng chứng:</b></p>
          <blockquote style="border-left: 4px solid #ef4444; padding-left: 10px; color: #555;">
            ${description}
          </blockquote>
          <p style="font-size: 12px; color: #888; margin-top: 20px;">Email tự động từ hệ thống NLU Hub.</p>
        </div>
      `;
      
      await sendMail(
        adminEmail,
        `🚨 [NLU Hub] Report Mới: ${reason}`,
        emailHtml
      );
    }

    return NextResponse.json({ success: true, message: "Đã gửi Báo cáo Tố cáo thành công. Admin sẽ xem xét và xử lý sớm nhất!" });
  } catch (error) {
    console.error("Lỗi đăng report:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
