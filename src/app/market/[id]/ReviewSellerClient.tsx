"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

export default function ReviewSellerClient({ sellerEmail, isLoggedIn, hasPhoneNumber, isBanned }: { sellerEmail: string, isLoggedIn: boolean, hasPhoneNumber: boolean, isBanned: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
      toast.error("⚠️ Vui lòng Cập nhật Số điện thoại trước khi Đánh giá để đảm bảo tính xác thực.");
      router.push("/profile");
      return;
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerEmail, rating, comment }),
      });
      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        setComment("");
        setRating(5);
        toast.success("Đánh giá thành công!");
        router.refresh();
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
        className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1.5 rounded-lg transition-colors border border-blue-200 dark:border-blue-900/50"
      >
        ⭐ Viết đánh giá
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Đánh giá Uy tín Người bán</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500 font-bold p-2">✕</button>
            </div>
            
            <div className="p-6">
              <form id="review-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Chấm điểm (1-5 Sao) *</label>
                  <div className="flex gap-2 justify-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-3xl transition-transform hover:scale-125 ${rating >= star ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Lời nhận xét *</label>
                  <textarea 
                    value={comment} 
                    onChange={e => setComment(e.target.value)} 
                    required 
                    rows={3} 
                    placeholder="Vd: Bạn này bán đồ uy tín, đúng như mô tả..." 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors">
                Hủy bỏ
              </button>
              <button type="submit" form="review-form" disabled={isLoading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
                {isLoading ? "⏳..." : "Gửi Đánh Giá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
