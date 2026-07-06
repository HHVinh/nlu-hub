"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

interface SubjectProps {
  subject: {
    _id: string;
    name: string;
    note?: string;
  };
  isAdmin?: boolean;
}

export default function SubjectCardClient({ subject, isAdmin = false }: SubjectProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(subject.name);
  const [note, setNote] = useState(subject.note || "");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/subjects/${subject._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), note: note.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Cập nhật thành công!");
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn chặn sự kiện click của thẻ Link bọc bên ngoài (nếu có)
    
    if (!confirm(`Bạn có chắc chắn muốn xóa môn "${subject.name}" không? Toàn bộ tài liệu bên trong sẽ bị ảnh hưởng!`)) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/subjects/${subject._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Xóa môn học thành công!");
        router.refresh();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleUpdate} className="p-5 rounded-xl border border-blue-400 bg-blue-50 dark:bg-slate-800 shadow-md">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 mb-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:border-blue-500 font-bold"
          required
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú (Tùy chọn)"
          className="w-full px-3 py-2 mb-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none text-sm"
        />
        <div className="flex gap-2">
          <button type="submit" disabled={isLoading} className="flex-1 py-1.5 bg-green-600 text-white rounded font-bold hover:bg-green-700 disabled:opacity-50 text-sm">
            Lưu
          </button>
          <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-1.5 bg-slate-300 text-slate-800 rounded font-bold hover:bg-slate-400 text-sm">
            Hủy
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="relative group p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md hover:border-blue-400 transition-all flex flex-col h-full">
      <Link href={`/subject/${subject._id}`} className="flex-grow">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          📚 {subject.name}
        </h3>
        {subject.note && (
          <p className="text-xs text-slate-500 mt-2 line-clamp-1 italic">{subject.note}</p>
        )}
      </Link>
      
      {/* Nút Sửa/Xóa (chỉ hiện khi rê chuột vào Card và là Admin) */}
      {isAdmin && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <button
            onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
            className="p-1.5 bg-amber-100 text-amber-700 rounded hover:bg-amber-200"
            title="Sửa môn học"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
            title="Xóa môn học"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}
