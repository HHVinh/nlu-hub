import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        await connectDB();
        
        // Kiểm tra xem sinh viên này đã có trong Database chưa
        const existingUser = await User.findOne({ email: user.email });

        // Nếu chưa có thì tạo mới
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            role: "user",
          });
          console.log("🌟 Đã tạo tài khoản mới cho:", user.email);
        }
        
        return true; // Cho phép đăng nhập
      } catch (error) {
        console.error("Lỗi khi lưu User vào DB:", error);
        return false; // Từ chối đăng nhập nếu lỗi
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
