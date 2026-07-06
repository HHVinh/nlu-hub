"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

export default function AskQuestionClient({ isLoggedIn, isBanned }: { isLoggedIn: boolean, isBanned: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsLoading(true);
    try {
      const tagArray = tags.split(",").map(t => t.trim()).filter(t => t !== "");
      
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tags: tagArray })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setIsOpen(false);
        setTitle("");
        setContent("");
        setTags("");
        toast.success("Câu hỏi đã được gửi thành công!");
        router.refresh();
      } else {
        if (res.status === 401) {
          signIn("google");
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

  const handleOpenModal = () => {
    if (!isLoggedIn) {
      signIn("google");
      return;
    }
    if (isBanned) {
      toast.error("🚫 Tài khoản của bạn đã bị CẤM vĩnh viễn, không thể thao tác.");
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex items-center gap-2"
      >
        <span className="text-xl">✍️</span> Đặt câu hỏi
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 relative">
            
            <button type="button" onClick={() => setIsOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500">
              ✕
            </button>

            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-6">Đặt câu hỏi mới</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tiêu đề (Tóm tắt vấn đề)</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="VD: Làm sao để đăng ký môn học bơi?" 
                required 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nội dung chi tiết</label>
              <textarea 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                placeholder="Trình bày chi tiết thắc mắc của bạn..." 
                required 
                rows={6}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              ></textarea>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Thẻ phân loại (Cách nhau bằng dấu phẩy)</label>
              <input 
                type="text" 
                value={tags} 
                onChange={e => setTags(e.target.value)} 
                placeholder="VD: Tín chỉ, Thể dục, Học phí" 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-xl">
                Hủy bỏ
              </button>
              <button type="submit" disabled={isLoading} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50">
                {isLoading ? "Đang đăng..." : "Đăng câu hỏi"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
