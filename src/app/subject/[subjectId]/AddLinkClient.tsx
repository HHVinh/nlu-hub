"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AddLinkProps {
  subjectId: string;
  user: { name?: string | null; email?: string | null } | null;
}

export default function AddLinkClient({ subjectId, user }: AddLinkProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null; // Nếu chưa đăng nhập thì ẩn luôn nút này (hoặc có thể hiện thông báo tùy ý)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          subjectId,
          uploaderEmail: user.email,
          uploaderName: user.name,
          url: url.trim(),
          type: "drive", // Đánh dấu đây là Link Drive
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        setTitle("");
        setUrl("");
        router.refresh();
      } else {
        toast.error(data.message || "Lỗi lưu tài liệu");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="py-3 px-4 bg-white text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 font-bold shadow-sm transition-all hover:-translate-y-1 w-full sm:w-[200px] flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-600">
          <path fillRule="evenodd" d="M4.5 9.75a6 6 0 0 1 11.573-2.226 3.75 3.75 0 0 1 4.133 4.303A4.5 4.5 0 0 1 18 20.25H6.75a5.25 5.25 0 0 1-2.25-10.5Z" clipRule="evenodd" />
        </svg>
        Link Drive
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-800 border border-blue-300 rounded-xl shadow-lg w-full sm:w-[350px]">
      <h4 className="font-bold text-slate-800 dark:text-slate-100">Dán Link Tài liệu / Drive</h4>
      <input
        type="text"
        placeholder="Tên tài liệu (VD: Slide bài giảng)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:border-blue-500 text-sm"
        required
      />
      <input
        type="url"
        placeholder="Dán link (https://drive.google.com/...)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:border-blue-500 text-sm"
        required
      />
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50 text-sm"
        >
          {isSaving ? "Đang lưu..." : "Lưu Link"}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-bold text-sm"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
