const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

async function testMail() {
  console.log("Testing with User:", process.env.GMAIL_USER);
  const mailOptions = {
    from: `"NLU Hub" <${process.env.GMAIL_USER}>`,
    to: "vinh0986585015@gmail.com",
    subject: `[NLU Hub Test] 💬 Test gửi mail từ Node.js`,
    html: `<h1>Đây là mail test trực tiếp</h1>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("GỬI THÀNH CÔNG!");
  } catch (error) {
    console.error("LỖI GỬI MAIL:", error);
  }
}

testMail();
