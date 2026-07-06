"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function MarketActionButtons({ productId, currentStatus }: { productId: string, currentStatus: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleMarkAsSold = async () => {
    if (!window.confirm("Bạn có chắc chắn món đồ này đã được bán/tặng xong? (Không thể hoàn tác)")) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/market/${productId}`, { method: "PUT" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        router.refresh();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn XÓA VĨNH VIỄN bài đăng này?")) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/market/${productId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        router.push("/market"); // Xóa xong thì quay về trang chủ Chợ
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-3 mt-6 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30">
      {currentStatus === "Đang bán" && (
        <button 
          onClick={handleMarkAsSold}
          disabled={isLoading}
          className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
        >
          {isLoading ? "⏳..." : "✅ Đánh dấu ĐÃ BÁN"}
        </button>
      )}
      
      <button 
        onClick={handleDelete}
        disabled={isLoading}
        className="flex-1 py-2.5 bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 font-bold rounded-lg transition-colors"
      >
        {isLoading ? "⏳..." : "🗑️ Xóa Bài"}
      </button>
    </div>
  );
}
