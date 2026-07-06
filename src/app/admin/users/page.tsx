import connectDB from "@/lib/db";
import UserProfile from "@/models/UserProfile";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
  await connectDB();

  // Fetch users, sorted by latest
  const users = await UserProfile.find({}).sort({ createdAt: -1 }).lean();
  
  // Serialize ObjectId to string
  const serializedUsers = users.map((u: any) => ({
    _id: u._id.toString(),
    name: u.name,
    email: u.email,
    phoneNumber: u.phoneNumber || "Chưa cập nhật",
    isBanned: u.isBanned || false,
    createdAt: u.createdAt.toISOString()
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">👥 Quản lý Sinh viên</h1>
        <p className="text-slate-500">Danh sách tất cả sinh viên đã đăng nhập vào hệ thống. Bạn có quyền Khóa hoặc Mở khóa tài khoản nếu phát hiện hành vi lừa đảo.</p>
      </div>
      
      <AdminUsersClient initialUsers={serializedUsers} />
    </div>
  );
}
