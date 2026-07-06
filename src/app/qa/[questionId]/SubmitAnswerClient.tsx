"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

export default function SubmitAnswerClient({ questionId, isLoggedIn, isBanned }: { questionId: string, isLoggedIn: boolean, isBanned: boolean }) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Bắt sự kiện khi bấm nút "Trả lời" ở một bình luận nào đó
  useEffect(() => {
    const handleReplyTo = (e: Event) => {
      const customEvent = e as CustomEvent;
      const authorName = customEvent.detail;
      setContent((prev) => prev ? `${prev} @${authorName} ` : `@${authorName} `);
      
      // Focus con trỏ vào ô nhập liệu
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };

    window.addEventListener("replyTo", handleReplyTo);
    return () => window.removeEventListener("replyTo", handleReplyTo);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!isLoggedIn) {
      signIn("google");
      return;
    }
    if (isBanned) {
      toast.error("🚫 Tài khoản của bạn đã bị CẤM vĩnh viễn, không thể thao tác.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/qa/${questionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success("Đăng câu trả lời thành công!");
        setContent("");
        router.refresh(); // Tải lại trang để hiện câu trả lời mới ngay lập tức
      } else {
        if (res.status === 401) {
          signIn("google"); // Gọi thẳng đăng nhập Google
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Câu trả lời của bạn</h3>
      <form onSubmit={handleSubmit}>
        <textarea 
          ref={textareaRef}
          value={content} 
          onChange={e => setContent(e.target.value)} 
          placeholder="Viết câu trả lời hoặc gợi ý của bạn vào đây..." 
          required 
          rows={5}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none mb-4"
        ></textarea>
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isLoading} 
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? "Đang gửi..." : "Đăng câu trả lời 🚀"}
          </button>
        </div>
      </form>
    </div>
  );
}
