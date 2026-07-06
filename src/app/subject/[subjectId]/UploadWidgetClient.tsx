"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface UploadWidgetProps {
  subjectId: string;
  user: { name?: string | null; email?: string | null } | null;
}

export default function UploadWidgetClient({ subjectId, user }: UploadWidgetProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Bắt buộc đăng nhập mới cho thấy nút Upload
  if (!user) {
    return (
      <div className="text-sm font-bold text-amber-600 bg-amber-100 px-4 py-2 rounded-lg border border-amber-300">
        🔒 Đăng nhập ở góc trên để Upload tài liệu!
      </div>
    );
  }

  const handleUploadSuccess = async (result: any) => {
    setIsSaving(true);
    
    const fileInfo = result.info;
    
    // Phân loại tài liệu dựa trên format hoặc đường link url trả về
    let type = "link";
    const ext = (fileInfo.format || fileInfo.secure_url.split('.').pop()).toLowerCase();
    
    if (ext.includes("pdf")) type = "pdf";
    else if (ext.includes("doc") || ext.includes("docx")) type = "word";
    else if (ext.includes("xls") || ext.includes("xlsx")) type = "excel";
    else if (ext.includes("zip") || ext.includes("rar")) type = "zip";
    else if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) type = "image";

    try {
      // Đã có Link Cloudinary, giờ đem Link gửi về cho Backend lưu vào MongoDB
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fileInfo.original_filename || "Tài liệu không tên",
          subjectId,
          uploaderEmail: user.email,
          uploaderName: user.name,
          url: fileInfo.secure_url,
          type: type,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Tải file lên thành công!");
        router.refresh(); // Tải lại trang để hiện tài liệu mới luôn
      } else {
        toast.error(data.message || "Lỗi lưu tài liệu");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CldUploadWidget 
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "nlu_hub_docs"}
      onSuccess={handleUploadSuccess}
      options={{
        sources: ["local", "url", "google_drive"], // Hỗ trợ up từ máy, Link hoặc Drive
        multiple: false,
        maxFiles: 1,
        // Chỉ cho phép upload PDF, Word, Excel, Zip và Hình ảnh
        clientAllowedFormats: ["pdf", "doc", "docx", "xls", "xlsx", "zip", "png", "jpg", "jpeg"],
        maxFileSize: 10485760, // Giới hạn 10MB để không bị spam
      }}
    >
      {({ open }) => {
        return (
          <button
            onClick={() => open()}
            disabled={isSaving}
            className="py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-1 w-full sm:w-[200px] flex items-center justify-center gap-2"
        >
          {isSaving ? (
            "⏳ Đang xử lý..."
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
              </svg>
              Tải Từ Máy
            </>
          )}
        </button>
        );
      }}
    </CldUploadWidget>
  );
}
