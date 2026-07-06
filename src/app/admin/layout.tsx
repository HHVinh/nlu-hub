import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Chốt chặn bảo mật 1: Kiểm tra Email
  if (!session || !session.user || session.user?.email !== process.env.ADMIN_EMAIL) {
    redirect("/"); // Đá văng về trang chủ nếu không phải Admin
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] flex flex-col sm:flex-row">
      {/* Sidebar Admin */}
      <div className="w-full sm:w-64 bg-slate-900 text-slate-300 p-6 flex flex-col shrink-0">
        <div className="text-white font-extrabold text-2xl mb-8 flex items-center gap-2">
          <span>🛡️</span> Admin Panel
        </div>
        
        <nav className="flex flex-col gap-2">
          <Link href="/admin" className="px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium hover:text-white flex items-center gap-3">
            <span>📊</span> Tổng quan
          </Link>
          <Link href="/admin/users" className="px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium hover:text-white flex items-center gap-3">
            <span>👥</span> Quản lý Sinh viên
          </Link>
          <Link href="/" className="px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium hover:text-white flex items-center gap-3 mt-8 border border-slate-700">
            <span>⬅️</span> Về Trang Chủ
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 sm:p-10 overflow-auto">
        {children}
      </div>
    </div>
  );
}
