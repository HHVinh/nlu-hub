"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

interface SubscribeProps {
  subjectId: string;
  defaultEmail?: string;
  isSubscribed?: boolean;
  isLoggedIn?: boolean;
  isBanned?: boolean;
}

export default function SubscribeButtonClient({ 
  subjectId, 
  defaultEmail = "", 
  isSubscribed = false, 
  isLoggedIn = false, 
  isBanned = false 
}: SubscribeProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      signIn("google");
      return;
    }
    if (isBanned) {
      toast.error("🚫 Tài khoản của bạn đã bị CẤM vĩnh viễn, không thể thao tác.");
      return;
    }
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), subjectId })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
        setIsOpen(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối đến máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-end">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="py-2 px-5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 font-bold rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-all flex items-center gap-2 border border-teal-200 dark:border-teal-800 shadow-sm"
      >
        <span className="text-xl">🔔</span> 
        <span>Nhận Thông Báo</span>
      </button>
      
      {/* Ghi chú nhỏ cho sinh viên hiểu */}
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium hidden sm:block">
        *Nhận email khi có tài liệu mới
      </p>
      
      {isOpen && (
        <form 
          onSubmit={handleSubscribe} 
          className="absolute top-full mt-3 right-0 w-80 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Đăng ký nhận Email</h4>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            Hệ thống sẽ gửi email cho bạn ngay khi có sinh viên khác tải tài liệu mới lên môn học này.
          </p>
          
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Nhập địa chỉ Email..." 
            required 
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl mb-4 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          
          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 mb-3"
          >
            {isLoading ? "⏳ Đang xử lý..." : "Đăng ký ngay"}
          </button>
          
          <p className="text-[11px] text-orange-500 dark:text-orange-400 italic text-center leading-tight">
            *Lưu ý: Nếu không thấy mail, vui lòng kiểm tra mục Thư rác (Spam) và chọn "Không phải thư rác" nhé!
          </p>
        </form>
      )}
    </div>
  );
}
