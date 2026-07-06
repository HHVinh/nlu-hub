"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function DeleteQuestionButton({ questionId }: { questionId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không? TẤT CẢ câu trả lời cũng sẽ bị xóa theo!")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/qa/${questionId}`, { method: "DELETE" });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Xóa câu hỏi thành công");
        router.push("/qa"); // Chuyển về trang danh sách Q&A sau khi xóa
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
      className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
      title="Xóa bài viết"
    >
      {isDeleting ? "⏳ Đang xóa..." : "🗑️ Xóa bài"}
    </button>
  );
}
