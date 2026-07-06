"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function MarkResolvedButtonClient({ itemId, isLost }: { itemId: string, isLost: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleMarkResolved = async () => {
    if (!confirm(isLost ? "Xác nhận bạn đã tìm thấy đồ?" : "Xác nhận bạn đã trả lại đồ?")) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/lost-items/${itemId}`, {
        method: "PUT",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã cập nhật trạng thái!");
        router.refresh();
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Lỗi kết nối Server!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleMarkResolved}
      disabled={isLoading}
      className="mt-2 w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-sm transition-colors"
    >
      {isLoading ? "Đang xử lý..." : "✅ Đánh dấu Đã giải quyết"}
    </button>
  );
}
