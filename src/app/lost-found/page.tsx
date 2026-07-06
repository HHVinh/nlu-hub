import connectDB from "@/lib/db";
import LostItem from "@/models/LostItem";
import UserProfile from "@/models/UserProfile";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import PostLostItemClient from "./PostLostItemClient";
import LostFoundFiltersClient from "./LostFoundFiltersClient";
import MarkResolvedButtonClient from "./MarkResolvedButtonClient";
import DeleteLostItemButtonClient from "./DeleteLostItemButtonClient";
import ReportSellerClient from "../market/[id]/ReportSellerClient";

function getTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "vừa xong";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export default async function LostFoundPage(props: { searchParams?: Promise<{ [key: string]: string | undefined }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;
  
  let userProfile = null;
  if (session?.user?.email) {
    userProfile = await UserProfile.findOne({ email: session.user.email }).lean();
  }
  
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentType = searchParams.type || "All";
  const currentCategory = searchParams.category || "All";

  // Xây dựng Filter
  const filter: any = {};
  if (currentType !== "All") filter.type = currentType;
  if (currentCategory !== "All") filter.category = currentCategory;

  // Lấy danh sách items, Sắp xếp: "Chưa giải quyết" lên trước, sau đó Mới nhất lên trước
  const items = await LostItem.find(filter).sort({ status: 1, createdAt: -1 }).lean();

  const categories = ["All", "Giấy tờ tùy thân", "Bóp/Ví", "Chìa khóa", "Đồ điện tử", "Khác"];

  return (
    <main className="flex flex-col py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full flex-grow">
        


        {/* Header & Post Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
              <span>🕵️‍♂️</span> Đồ Thất Lạc
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
              Nơi tìm/trả lại những món đồ đánh rơi quanh khuôn viên trường. (Tối đa 5 bài/ngày)
            </p>
          </div>
          <PostLostItemClient 
            isLoggedIn={!!session?.user} 
            hasPhoneNumber={!!userProfile?.phoneNumber}
            isBanned={userProfile?.isBanned || false}
            userPhoneNumber={userProfile?.phoneNumber || ""}
          />
        </div>

        {/* Banner Cảnh Báo An Toàn */}
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm mb-8 flex items-start gap-4">
          <div className="text-red-500 text-2xl">⚠️</div>
          <div>
            <h3 className="font-bold text-red-800 dark:text-red-400">CẢNH BÁO LỪA ĐẢO CHUỘC ĐỒ</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1 leading-relaxed">
              NLU Hub nghiêm cấm hành vi nhặt được đồ nhưng <b>ĐÒI TIỀN CHUỘC</b>. Tuyệt đối <b>KHÔNG</b> chuyển khoản tiền chuộc hoặc tiền ship xe ôm trước khi nhận lại đồ trực tiếp. Nếu phát hiện kẻ gian tống tiền, hãy dùng nút <b>BÁO CÁO</b> để Admin cấm tài khoản vĩnh viễn!
            </p>
          </div>
        </div>

        {/* Bộ Lọc (Filters) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex flex-wrap gap-4 items-center">
          
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <Link href={`/lost-found?type=All&category=${currentCategory}`} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${currentType === "All" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              Tất cả
            </Link>
            <Link href={`/lost-found?type=Lost&category=${currentCategory}`} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${currentType === "Lost" ? "bg-red-500 text-white shadow-sm" : "text-slate-500 hover:text-red-500"}`}>
              Đang Tìm Đồ (Lost)
            </Link>
            <Link href={`/lost-found?type=Found&category=${currentCategory}`} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${currentType === "Found" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-500 hover:text-emerald-500"}`}>
              Nhặt Được Đồ (Found)
            </Link>
          </div>

          <LostFoundFiltersClient 
            currentType={currentType} 
            currentCategory={currentCategory} 
          />

        </div>

        {/* Danh sách */}
        {items.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <span className="text-6xl mb-4 block">👻</span>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Không tìm thấy món đồ nào!</h3>
            <p className="text-slate-500 mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm nhé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item: any) => {
              const isResolved = item.status === "Đã giải quyết xong";
              const isLost = item.type === "Lost";
              
              // 1. Bảo mật: Ẩn Liên hệ nếu chưa đăng nhập
              const isLoggedIn = !!session?.user;
              let contactUrl = isLoggedIn ? item.contactInfo : "/login";
              let contactLabel = isLoggedIn ? "Liên hệ" : "Đăng nhập để xem Liên hệ";
              
              if (isLoggedIn) {
                const phoneRegex = /^[0-9]{10,11}$/;
                if (phoneRegex.test(item.contactInfo.replace(/[^0-9]/g, ''))) {
                  const cleanPhone = item.contactInfo.replace(/[^0-9]/g, '');
                  contactUrl = `https://zalo.me/${cleanPhone}`;
                  contactLabel = `Zalo (${cleanPhone})`;
                } else if (!item.contactInfo.startsWith("http")) {
                  contactUrl = `tel:${item.contactInfo}`;
                  contactLabel = `Gọi (${item.contactInfo})`;
                }
              }

              return (
                <div key={item._id.toString()} className={`group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border ${isLost ? 'border-red-100 dark:border-red-900/30' : 'border-emerald-100 dark:border-emerald-900/30'} shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col`}>
                  
                  {/* Badge Mất / Nhặt */}
                  <div className={`absolute top-4 left-4 px-3 py-1 text-xs font-black text-white rounded-lg uppercase shadow-lg ${isLost ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {isLost ? "TÌM ĐỒ (LOST)" : "TRẢ ĐỒ (FOUND)"}
                  </div>

                  {/* Lớp phủ Đã giải quyết */}
                  {isResolved && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                      <div className="bg-slate-800 text-white border-2 border-white/20 px-6 py-2 rounded-xl font-black text-xl rotate-[-12deg] shadow-2xl">
                        {isLost ? "ĐÃ TÌM THẤY" : "ĐÃ TRẢ LẠI"}
                      </div>
                    </div>
                  )}

                  {/* Ảnh món đồ (Nếu có) */}
                  {item.imageUrl ? (
                    <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400">
                      <span className="text-5xl mb-2">📦</span>
                      <span className="text-sm font-medium">Không có ảnh</span>
                    </div>
                  )}

                  {/* Nội dung */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex gap-2 mb-3">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-md uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-2 line-clamp-2 leading-tight">
                      {item.title}
                    </h3>
                    
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                      {item.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="text-xs text-slate-400 font-medium">
                        Bởi <b>{item.authorName}</b> • {getTimeAgo(new Date(item.createdAt))} (sẽ xóa sau 30 ngày)
                      </div>
                    </div>
                    
                    
                    {!isResolved && (
                      <div className="mt-4">
                        <a 
                          href={contactUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full block text-center py-2.5 font-bold text-sm rounded-xl transition-transform hover:scale-105 active:scale-95 ${isLost ? 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 dark:text-emerald-400'}`}
                        >
                          💬 {contactLabel}
                        </a>
                        
                        {/* Nút báo cáo (Khách cũng thấy nếu đăng nhập) */}
                        {isLoggedIn && session.user.email !== item.authorEmail && (
                          <div className="mt-2 text-center">
                            <ReportSellerClient 
                              accusedEmail={item.authorEmail}
                              productUrl={`/lost-found (Item: ${item.title})`}
                              isLoggedIn={isLoggedIn}
                              hasPhoneNumber={!!userProfile?.phoneNumber}
                              isBanned={userProfile?.isBanned || false}
                            />
                          </div>
                        )}
                        
                        {/* Nút đánh dấu đã giải quyết (Chỉ tác giả mới thấy) */}
                        {isLoggedIn && session.user.email === item.authorEmail && (
                          <MarkResolvedButtonClient itemId={item._id.toString()} isLost={isLost} />
                        )}
                      </div>
                    )}

                    {/* Nút xóa bài viết (Tác giả hoặc Admin) - Hiển thị kể cả khi đã giải quyết */}
                    {isLoggedIn && (session.user.email === item.authorEmail || isAdmin) && (
                      <div className={isResolved ? "mt-4 relative z-20" : "mt-2"}>
                        <DeleteLostItemButtonClient itemId={item._id.toString()} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </main>
  );
}
