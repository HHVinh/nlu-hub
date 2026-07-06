"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

export default function PostLostItemClient({ isLoggedIn, hasPhoneNumber, isBanned, userPhoneNumber }: { isLoggedIn: boolean, hasPhoneNumber: boolean, isBanned: boolean, userPhoneNumber: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Form State
  const [type, setType] = useState<"Lost" | "Found">("Lost");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Giấy tờ tùy thân");
  const [imageUrl, setImageUrl] = useState("");
  const [contactInfo, setContactInfo] = useState(userPhoneNumber || "");
  const [newPhone, setNewPhone] = useState("");

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
      toast.error("⚠️ Bạn cần cập nhật Số điện thoại ở Trang cá nhân trước khi Đăng tin.");
      router.push("/profile");
      return;
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/lost-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, description, category, imageUrl, contactInfo }),
      });
      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        setTitle("");
        setDescription("");
        setImageUrl("");
        router.refresh();
        toast.success("Đăng tin thành công!");
      } else {
        if (res.status === 401) signIn("google");
        else toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleOpenClick}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
      >
        <span>📢</span> Báo Mất / Nhặt Được Đồ
      </button>

      {/* MODAL ĐĂNG TIN */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Đăng tin Thất Lạc</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500 font-bold p-2">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              
              {/* Type Switcher */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setType("Lost")}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${type === "Lost" ? "bg-red-500 text-white shadow-md" : "text-slate-500 hover:text-slate-700"}`}
                >
                  😭 Bị Mất Đồ (TÌM ĐỒ)
                </button>
                <button
                  type="button"
                  onClick={() => setType("Found")}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${type === "Found" ? "bg-emerald-500 text-white shadow-md" : "text-slate-500 hover:text-slate-700"}`}
                >
                  😇 Nhặt Được Đồ (TRẢ ĐỒ)
                </button>
              </div>

              {type === "Found" && (
                <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-3 rounded-r-lg">
                  <h4 className="text-amber-800 dark:text-amber-300 font-bold text-sm flex items-center gap-2"><span>🛡️</span> Mẹo Bảo Mật:</h4>
                  <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">
                    Nếu bạn nhặt được thẻ SV/CCCD, hãy <b>che đi Mã số/Ngày sinh</b>. Đừng đăng toàn bộ bức ảnh lên mạng để phòng kẻ gian nhận vơ! Khi gặp mặt, hãy bắt họ đọc đúng mã số để xác nhận.
                  </p>
                </div>
              )}

              <form id="lost-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Tiêu đề (Vd: {type === "Lost" ? "Đánh rơi thẻ Sinh viên tên Nguyễn Văn A" : "Nhặt được chùm chìa khóa ở Khu B"}) *
                  </label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Loại đồ vật *</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                      {["Giấy tờ tùy thân", "Bóp/Ví", "Chìa khóa", "Đồ điện tử", "Khác"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mô tả chi tiết *</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} placeholder={type === "Lost" ? "Mô tả thời gian rơi, đặc điểm đồ vật..." : "Mô tả vị trí nhặt được, hẹn gặp ở đâu để trả lại..."} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Link Ảnh minh họa (Tùy chọn)</label>
                  <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Dán link ảnh vào đây (Không bắt buộc)" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Thông tin liên hệ (SĐT / Facebook) *</label>
                  <input type="text" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required placeholder="SĐT sẽ tự động mở Zalo" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors">
                Hủy bỏ
              </button>
              <button type="submit" form="lost-form" disabled={isLoading} className={`px-6 py-2.5 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 ${type === 'Lost' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                {isLoading ? "⏳..." : type === "Lost" ? "📢 Đăng TÌM ĐỒ" : "😇 Đăng TRẢ ĐỒ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
