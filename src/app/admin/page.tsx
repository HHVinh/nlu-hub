import connectDB from "@/lib/db";
import UserProfile from "@/models/UserProfile";
import Product from "@/models/Product";
import LostItem from "@/models/LostItem";
import Question from "@/models/Question";
import Document from "@/models/Document";

export default async function AdminDashboardPage() {
  await connectDB();

  const totalUsers = await UserProfile.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalLostItems = await LostItem.countDocuments();
  const totalQuestions = await Question.countDocuments();
  const totalDocuments = await Document.countDocuments();

  const bannedUsers = await UserProfile.countDocuments({ isBanned: true });

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">📊 Tổng quan hệ thống</h1>
      <p className="text-slate-500 mb-8">Chào mừng Admin, dưới đây là thống kê thời gian thực của NLU Hub.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Thống kê Sinh Viên */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl">
              👥
            </div>
            <div>
              <h3 className="font-bold text-slate-500 text-sm uppercase tracking-wider">Tổng Sinh Viên</h3>
              <div className="text-3xl font-black text-slate-800 dark:text-white">{totalUsers}</div>
            </div>
          </div>
          <div className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg inline-block">
            {bannedUsers} tài khoản bị khóa
          </div>
        </div>

        {/* Thống kê Chợ */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-2xl">
              🛒
            </div>
            <div>
              <h3 className="font-bold text-slate-500 text-sm uppercase tracking-wider">Tin Chợ Sinh Viên</h3>
              <div className="text-3xl font-black text-slate-800 dark:text-white">{totalProducts}</div>
            </div>
          </div>
        </div>

        {/* Thống kê Thất Lạc */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-2xl">
              🕵️‍♂️
            </div>
            <div>
              <h3 className="font-bold text-slate-500 text-sm uppercase tracking-wider">Tin Đồ Thất Lạc</h3>
              <div className="text-3xl font-black text-slate-800 dark:text-white">{totalLostItems}</div>
            </div>
          </div>
        </div>

        {/* Thống kê Hỏi Đáp */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl">
              💬
            </div>
            <div>
              <h3 className="font-bold text-slate-500 text-sm uppercase tracking-wider">Câu hỏi Q&A</h3>
              <div className="text-3xl font-black text-slate-800 dark:text-white">{totalQuestions}</div>
            </div>
          </div>
        </div>

        {/* Thống kê Tài liệu */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-2xl">
              📚
            </div>
            <div>
              <h3 className="font-bold text-slate-500 text-sm uppercase tracking-wider">Tài liệu đã tải lên</h3>
              <div className="text-3xl font-black text-slate-800 dark:text-white">{totalDocuments}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
