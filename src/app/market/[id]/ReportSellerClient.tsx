"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ReportSellerClient({ accusedEmail, productUrl, isLoggedIn, hasPhoneNumber, isBanned }: { accusedEmail: string, productUrl: string, isLoggedIn: boolean, hasPhoneNumber: boolean, isBanned: boolean }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("Lừa đảo / Gian lận");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenClick = () => {
    if (!isLoggedIn) {
      signIn("google");
      return;
    }
    if (isBanned) {
      toast.error("🚫 Tài khoản của bạn đã bị CẤM vĩnh viễn, không thể thao tác.");
      return;
    }
    if (!hasPhoneNumber) {
      toast.error("⚠️ Vui lòng Cập nhật Số điện thoại trước khi Báo cáo để đảm bảo tính xác thực.");
      router.push("/profile");
      return;
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accusedEmail, productUrl, reason, description }),
      });
      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        setDescription("");
        toast.success("Thành công: " + data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleOpenClick}
        className="text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-3 py-1.5 rounded-lg transition-colors border border-red-200 dark:border-red-900/50"
      >
        🚩 Báo cáo Lừa đảo
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-red-50 dark:bg-red-900/20">
              <h2 className="text-xl font-extrabold text-red-800 dark:text-red-300">Tố Cáo Tài Khoản Này</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500 font-bold p-2">✕</button>
            </div>
            
            <div className="p-6">
              <form id="report-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Lý do báo cáo *</label>
                  <select value={reason} onChange={e => setReason(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none">
                    {["Lừa đảo / Gian lận", "Hàng giả / Kém chất lượng", "Số điện thoại ảo", "Bán hàng cấm", "Khác"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mô tả chi tiết bằng chứng *</label>
                  <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    required 
                    rows={4} 
                    placeholder="Hãy mô tả rõ hành vi lừa đảo để Admin xử lý nhanh nhất..." 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors">
                Hủy bỏ
              </button>
              <button type="submit" form="report-form" disabled={isLoading} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
                {isLoading ? "⏳..." : "Gửi Báo Cáo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
