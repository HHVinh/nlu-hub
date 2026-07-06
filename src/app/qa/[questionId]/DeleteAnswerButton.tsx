"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function DeleteAnswerButton({ questionId, answerId }: { questionId: string, answerId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/qa/${questionId}/answers/${answerId}`, { method: "DELETE" });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Xóa câu trả lời thành công");
        router.refresh(); // Tải lại trang sau khi xóa
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
      title="Xóa bình luận"
    >
      {isDeleting ? "..." : "Xóa"}
    </button>
  );
}
