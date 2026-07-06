"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AddSubjectClient({ facultyId }: { facultyId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), note: note.trim(), faculty: facultyId }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Thêm môn học thành công!");
        setIsOpen(false);
        setName("");
        setNote("");
        router.refresh(); // Gọi lại Server Component để update danh sách môn học mới
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all hover:-translate-y-1 shadow-md shadow-blue-500/20 whitespace-nowrap"
      >
        + Thêm môn học
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0 items-start sm:items-center">
      <input
        type="text"
        placeholder="Tên môn học (Vd: Toán cao cấp)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 min-w-[200px]"
        required
      />
      <input
        type="text"
        placeholder="Ghi chú (Không bắt buộc)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 min-w-[200px]"
      />
      <div className="flex gap-2 w-full sm:w-auto">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:opacity-50"
        >
          {isLoading ? "Đang lưu..." : "Lưu"}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
