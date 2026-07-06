"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type User = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isBanned: boolean;
  createdAt: string;
};

export default function AdminUsersClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  const toggleBanStatus = async (email: string, currentStatus: boolean) => {
    if (!confirm(`Bạn có chắc chắn muốn ${currentStatus ? 'MỞ KHÓA' : 'KHÓA'} tài khoản ${email}?`)) return;

    setLoadingEmail(email);
    const toastId = toast.loading("Đang xử lý...");

    try {
      const res = await fetch(`/api/admin/users/${email}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: !currentStatus })
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message, { id: toastId });
        // Cập nhật state
        setUsers(users.map(u => u.email === email ? { ...u, isBanned: !currentStatus } : u));
      } else {
        toast.error(data.message || "Có lỗi xảy ra", { id: toastId });
      }
    } catch (error) {
      toast.error("Lỗi kết nối", { id: toastId });
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 uppercase font-bold text-xs">
            <tr>
              <th className="px-6 py-4">Tên / Email</th>
              <th className="px-6 py-4">Số điện thoại</th>
              <th className="px-6 py-4">Ngày tham gia</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800 dark:text-white">{user.name}</div>
                  <div className="text-xs">{user.email}</div>
                </td>
                <td className="px-6 py-4 font-medium">{user.phoneNumber}</td>
                <td className="px-6 py-4">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4">
                  {user.isBanned ? (
                    <span className="px-3 py-1 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-bold text-xs rounded-full">Đã bị khóa</span>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold text-xs rounded-full">Bình thường</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => toggleBanStatus(user.email, user.isBanned)}
                    disabled={loadingEmail === user.email}
                    className={`px-4 py-2 font-bold text-xs rounded-lg transition-colors disabled:opacity-50 ${
                      user.isBanned 
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300' 
                        : 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400'
                    }`}
                  >
                    {loadingEmail === user.email ? "⏳ Đang xử lý" : user.isBanned ? "🔓 Mở Khóa" : "🔒 Khóa TK"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-10 text-slate-500">Chưa có người dùng nào.</div>
        )}
      </div>
    </div>
  );
}
