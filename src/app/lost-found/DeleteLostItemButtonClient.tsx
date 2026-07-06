"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function DeleteLostItemButtonClient({ itemId }: { itemId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không? Không thể hoàn tác!")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/lost-items/${itemId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Xóa bài viết thành công!");
        router.refresh();
      } else {
        toast.error(data.message || "Xóa thất bại!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối Server!");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      title="Xóa bài viết"
      className="mt-2 w-full py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold rounded-xl text-sm transition-colors"
    >
      {isDeleting ? "⏳ Đang xóa..." : "🗑️ Xóa bài"}
    </button>
  );
}
