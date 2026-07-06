"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

export default function PostProductClient({ isLoggedIn, hasPhoneNumber, isBanned, userPhoneNumber }: { isLoggedIn: boolean, hasPhoneNumber: boolean, isBanned: boolean, userPhoneNumber: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("Giáo trình");
  const [condition, setCondition] = useState("Đã sử dụng");
  const [contactInfo, setContactInfo] = useState(userPhoneNumber || "");
  const [newPhone, setNewPhone] = useState("");

  const handleOpenClick = () => {
    if (!isLoggedIn) {
      signIn("google");
      return;
    }
    if (isBanned) {
      toast.error("🚫 Tài khoản của bạn đã bị CẤM vĩnh viễn do vi phạm tiêu chuẩn cộng đồng (Lừa đảo/Gian lận).");
      return;
    }
    if (!hasPhoneNumber) {
      toast.error("⚠️ Bạn cần cập nhật Số điện thoại ở Trang cá nhân trước khi Đăng Tặng/Bán đồ.");
      router.push("/profile");
      return;
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      signIn("google");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: price ? Number(price) : 0,
          imageUrl,
          category,
          condition,
          contactInfo
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        // Reset form
        setTitle(""); setDescription(""); setPrice(""); setImageUrl(""); setContactInfo("");
        toast.success("Đăng tin thành công!");
        router.refresh();
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
        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
      >
        <span>➕</span> Đăng Tặng / Bán Đồ
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Đăng Bán / Tặng Món Đồ Mới</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500 font-bold p-2">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="post-product-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tên món đồ *</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Vd: Áo đoàn size L, Giáo trình Toán CC" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phân loại *</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                      {["Giáo trình", "Đồ điện tử", "Đồ dùng học tập", "Phương tiện", "Phòng trọ", "Khác"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tình trạng *</label>
                    <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                      {["Mới 100%", "Như mới", "Đã sử dụng", "Cũ"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Giá tiền (VNĐ) *</label>
                    <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} required placeholder="Nhập 0 nếu muốn tặng miễn phí" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
                    <p className="text-xs text-orange-500 mt-1 italic">*Nhập 0 nếu cho tặng miễn phí</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Link Ảnh (Tùy chọn)</label>
                    <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Dán link ảnh vào đây (Nếu có)" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
                    <p className="text-xs text-slate-400 mt-1 italic">*Bỏ trống hệ thống sẽ dùng ảnh mặc định</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Thông tin liên hệ (SĐT / Zalo / Facebook) *</label>
                  <input type="text" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required placeholder="Vd: Nhập Số điện thoại (sẽ mở Zalo) hoặc Link Facebook" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mô tả chi tiết *</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} placeholder="Mô tả kỹ tình trạng đồ để người mua dễ hình dung..." className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"></textarea>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors">
                Hủy bỏ
              </button>
              <button type="submit" form="post-product-form" disabled={isLoading} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md">
                {isLoading ? "⏳ Đang xử lý..." : "🚀 Đăng Bài Ngay"}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
