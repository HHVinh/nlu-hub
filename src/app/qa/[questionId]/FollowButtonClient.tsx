"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

export default function FollowButtonClient({ questionId, isFollowed, isLoggedIn, isBanned }: { questionId: string, isFollowed: boolean, isLoggedIn: boolean, isBanned: boolean }) {
  const [isFollowing, setIsFollowing] = useState(isFollowed);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggleFollow = async () => {
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
      const res = await fetch(`/api/qa/${questionId}`, { method: "PUT" });
      const data = await res.json();
      if (data.success) {
        setIsFollowing(data.isFollowing);
        toast.success(data.message);
        router.refresh();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggleFollow}
      disabled={isLoading}
      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors flex items-center gap-2 ${
        isFollowing 
          ? "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
          : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50"
      }`}
    >
      {isLoading ? "⏳ Đang xử lý..." : isFollowing ? "✅ Đang theo dõi" : "🔔 Theo dõi bài viết"}
    </button>
  );
}
