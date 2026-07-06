import nodemailer from "nodemailer";

// Cấu hình "Người đưa thư" (Transporter)
// Sử dụng Gmail làm dịch vụ trung gian để gửi mail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // Mật khẩu ứng dụng (App Password) của Gmail
  },
});

export const sendNewDocumentNotification = async (
  emails: string[],
  subjectName: string,
  docTitle: string,
  docUrl: string
) => {
  if (emails.length === 0) return;

  const mailOptions = {
    from: `"NLU Hub" <${process.env.GMAIL_USER}>`,
    bcc: emails, // Dùng BCC (Blind Carbon Copy) để giấu danh sách Email của sinh viên, bảo vệ quyền riêng tư
    subject: `[NLU Hub] 📚 Có tài liệu mới cho môn ${subjectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #1e40af;">Xin chào Sinh viên Nông Lâm,</h2>
        <p style="font-size: 16px; color: #334155;">
          Môn học <strong>${subjectName}</strong> mà bạn đang theo dõi vừa được cập nhật một tài liệu mới:
        </p>
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <h3 style="margin: 0; color: #0f172a;">${docTitle}</h3>
        </div>
        <a href="${docUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Xem tài liệu ngay
        </a>
        <p style="font-size: 14px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          Bạn nhận được email này vì đã đăng ký nhận thông báo trên NLU Hub.<br>
          Cảm ơn bạn đã đồng hành cùng cộng đồng!
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Đã gửi email thông báo cho ${emails.length} người.`);
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
  }
};

export const sendNewAnswerNotification = async (
  authorEmail: string,
  questionTitle: string,
  answerAuthorName: string,
  questionUrl: string
) => {
  if (!authorEmail) return;

  const mailOptions = {
    from: `"NLU Hub" <${process.env.GMAIL_USER}>`,
    to: authorEmail,
    subject: `[NLU Hub] 💬 ${answerAuthorName} vừa trả lời câu hỏi của bạn!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #1e40af;">Bạn có phản hồi mới!</h2>
        <p style="font-size: 16px; color: #334155;">
          Bạn học <strong>${answerAuthorName}</strong> vừa để lại câu trả lời cho bài viết của bạn:
        </p>
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <h3 style="margin: 0; color: #0f172a;">${questionTitle}</h3>
        </div>
        <a href="${questionUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Vào đọc câu trả lời ngay
        </a>
        <p style="font-size: 14px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          NLU Hub - Cộng đồng Sinh viên Đại học Nông Lâm TP.HCM
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Đã gửi email báo có câu trả lời cho ${authorEmail}.`);
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
  }
};

export const sendMail = async (to: string, subject: string, html: string) => {
  if (!to) return;

  const mailOptions = {
    from: `"NLU Hub" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Đã gửi email chung tới ${to}.`);
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
  }
};
