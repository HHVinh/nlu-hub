"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [phone, setPhone] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfileData();
    }
  }, [status]);

  const fetchProfileData = async () => {
    try {
      const res = await fetch("/api/profile");
      const json = await res.json();
      if (json.success) {
        setData(json);
        if (json.profile?.phoneNumber) {
          setPhone(json.profile.phoneNumber);
        }
      }
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu cá nhân");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    // Tạo toast pending
    const toastId = toast.loading("Đang cập nhật số điện thoại...");
    
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const result = await res.json();
      
      if (result.success) {
        toast.success("Cập nhật số điện thoại thành công!", { id: toastId });
      } else {
        toast.error(result.message, { id: toastId });
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ", { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  if (status === "loading" || isLoading) {
    return <div className="min-h-screen flex justify-center items-center font-bold text-slate-500">Đang tải hồ sơ...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Hồ Sơ */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          <img 
            src={session.user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} 
            alt="Avatar" 
            className="w-24 h-24 rounded-full shadow-lg border-4 border-white dark:border-slate-800"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">{session.user?.name}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">✉️ {session.user?.email}</p>
            {data?.profile?.isBanned && (
              <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-bold text-xs rounded-full">
                🚫 TÀI KHOẢN BỊ CẤM
              </span>
            )}
          </div>
          
          <div className="w-full md:w-auto bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <form onSubmit={handleUpdatePhone} className="flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại liên hệ</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0987654321"
                  className="w-48 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  Lưu
                </button>
              </div>
              {!phone && <p className="text-xs text-orange-500 font-medium">⚠️ Bạn cần cập nhật SĐT để mua bán / tìm đồ.</p>}
            </form>
          </div>
        </div>

        {/* Dashboard Hoạt động */}
        <div className="space-y-8">
          
          {/* Chợ Sinh Viên */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <span>🛒</span> Tin đăng Chợ Sinh Viên ({data?.activities?.products?.length || 0})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data?.activities?.products?.length === 0 ? (
                <p className="text-slate-400 text-sm">Chưa có bài đăng nào.</p>
              ) : (
                data?.activities?.products?.map((item: any) => (
                  <Link href={`/market/${item._id}`} key={item._id} className="block bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors">
                    <h3 className="font-bold text-slate-800 dark:text-white truncate">{item.title}</h3>
                    <div className="text-sm text-slate-500 mt-1">{item.price === 0 ? 'Tặng Miễn Phí' : `${item.price.toLocaleString()} đ`}</div>
                    <div className="mt-2 inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-lg text-slate-600 dark:text-slate-400">
                      {item.status}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Đồ Thất Lạc */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <span>🕵️‍♂️</span> Tin Đồ Thất Lạc ({data?.activities?.lostItems?.length || 0})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data?.activities?.lostItems?.length === 0 ? (
                <p className="text-slate-400 text-sm">Chưa có bài đăng nào.</p>
              ) : (
                data?.activities?.lostItems?.map((item: any) => (
                  <Link href={`/lost-found`} key={item._id} className="block bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-red-500 transition-colors">
                    <div className="text-xs font-bold text-red-500 mb-1">{item.type}</div>
                    <h3 className="font-bold text-slate-800 dark:text-white truncate">{item.title}</h3>
                    <div className="mt-2 inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-lg text-slate-600 dark:text-slate-400">
                      {item.status}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Hỏi Đáp */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <span>💬</span> Câu hỏi Q&A ({data?.activities?.questions?.length || 0})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data?.activities?.questions?.length === 0 ? (
                <p className="text-slate-400 text-sm">Chưa có bài đăng nào.</p>
              ) : (
                data?.activities?.questions?.map((item: any) => (
                  <Link href={`/qa/${item._id}`} key={item._id} className="block bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-purple-500 transition-colors">
                    <h3 className="font-bold text-slate-800 dark:text-white line-clamp-2">{item.title}</h3>
                    <div className="text-xs text-slate-500 mt-2">{item.answersCount} câu trả lời</div>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
