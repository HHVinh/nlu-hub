"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface DocumentProps {
  doc: {
    _id: string;
    title: string;
    url: string;
    type: string;
    uploaderName: string;
    uploaderEmail: string;
    createdAt: string;
  };
  currentUserEmail: string | null;
  adminEmail: string | null;
}

export default function DocumentCardClient({ doc, currentUserEmail, adminEmail }: DocumentProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(doc.title);
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xóa tài liệu "${doc.title}" khỏi danh sách web không?`)) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/documents/${doc._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Xóa tài liệu thành công!");
        router.refresh();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/documents/${doc._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setIsEditing(false);
        toast.success("Đổi tên thành công!");
        router.refresh();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleUpdate} className="flex flex-col sm:flex-row gap-3 p-5 rounded-xl border border-blue-400 bg-blue-50 dark:bg-slate-800 shadow-md">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:border-blue-500 font-bold"
          required
        />
        <div className="flex gap-2">
          <button type="submit" disabled={isSaving} className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 disabled:opacity-50 text-sm whitespace-nowrap">
            {isSaving ? "Đang lưu..." : "Lưu tên"}
          </button>
          <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-300 text-slate-800 rounded font-bold hover:bg-slate-400 text-sm whitespace-nowrap">
            Hủy
          </button>
        </div>
      </form>
    );
  }

  // Cập nhật lại Icon cho phong phú
  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📑';
      case 'word': return '📄';
      case 'excel': return '📊';
      case 'zip': return '🗂️';
      case 'image': return '📸';
      case 'drive': return '📂';
      default: return '📎';
    }
  };

  // Tạo màu sắc cho Nhãn (Badge) để nhìn phát biết ngay loại file
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'word': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'excel': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'zip': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'drive': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      case 'image': return 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-all gap-4">
      <div className="flex items-start gap-4 flex-1">
        <div className="text-4xl">
          {getIcon(doc.type)}
        </div>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-600 dark:hover:text-blue-400">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{doc.title}</h3>
            </a>
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getBadgeColor(doc.type)}`}>
              {doc.type}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">👤 {doc.uploaderName}</span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">📅 {doc.createdAt}</span>
          </div>
        </div>
      </div>
      
      {/* Cụm Nút bấm: Mở -> Sửa -> Xóa */}
      <div className="flex items-center gap-2 mt-4 sm:mt-0 justify-end">
        <a 
          href={doc.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-6 py-2.5 bg-blue-600 dark:bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-center shadow-md whitespace-nowrap mr-2"
        >
          Mở tài liệu
        </a>

        {/* CƠ CHẾ PHÂN QUYỀN (AUTHORIZATION) */}
        {/* Chỉ hiện nút Sửa/Xóa khi người đang xem chính là người up, HOẶC người đang xem là Admin */}
        {(currentUserEmail === doc.uploaderEmail || currentUserEmail === adminEmail) && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
              className="px-3 py-2.5 bg-amber-100 text-amber-700 font-medium rounded-lg hover:bg-amber-200 transition-colors"
              title="Sửa tên tài liệu"
            >
              Sửa ✏️
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-2.5 bg-red-100 text-red-600 font-medium rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
              title="Xóa tài liệu khỏi Web"
            >
              {isDeleting ? "..." : "Xóa 🗑️"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
