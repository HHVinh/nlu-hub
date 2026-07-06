import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Link from "next/link";
import PostProductClient from "./PostProductClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import UserProfile from "@/models/UserProfile";

// Hàm tiện ích lấy ảnh mặc định
export function getDefaultImage(category: string) {
  switch (category) {
    case "Giáo trình": return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop";
    case "Đồ điện tử": return "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600&auto=format&fit=crop";
    case "Đồ dùng học tập": return "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?q=80&w=600&auto=format&fit=crop";
    case "Phương tiện": return "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&auto=format&fit=crop";
    case "Phòng trọ": return "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop";
    default: return "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=600&auto=format&fit=crop";
  }
}

function getTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} giây trước`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

// Bắt lỗi Type cho param
export default async function MarketPage(props: { searchParams?: Promise<{ category?: string, isFree?: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  
  let userProfile = null;
  if (session?.user?.email) {
    userProfile = await UserProfile.findOne({ email: session.user.email }).lean();
  }
  
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentCategory = searchParams.category || "All";
  const isFree = searchParams.isFree === "true";

  // Bộ lọc
  const filter: any = {};
  if (currentCategory !== "All") filter.category = currentCategory;
  if (isFree) filter.price = 0;

  // Lấy danh sách sản phẩm
  // "Đang bán" (chữ a) < "Đã bán" (chữ ã) trong bảng mã Unicode. 
  // Nên sort status: 1 (tăng dần) sẽ đẩy "Đang bán" lên đầu, "Đã bán" xuống cuối.
  const products = await Product.find(filter).sort({ status: 1, createdAt: -1 }).lean();

  const categories = ["All", "Giáo trình", "Đồ điện tử", "Đồ dùng học tập", "Phương tiện", "Phòng trọ", "Khác"];

  return (
    <main className="flex flex-col py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full flex-grow">
        


        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
              🛒 Chợ Sinh Viên
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
              Mua bán, trao đổi, và chia sẻ đồ cũ dễ dàng. (Tối đa 15 bài/ngày)
            </p>
          </div>
          <PostProductClient 
            isLoggedIn={!!session?.user} 
            hasPhoneNumber={!!userProfile?.phoneNumber}
            isBanned={userProfile?.isBanned || false}
            userPhoneNumber={userProfile?.phoneNumber || ""}
          />
        </div>

        {/* Banner Miễn Trừ Trách Nhiệm */}
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm mb-8 flex items-start gap-4">
          <div className="text-red-500 text-2xl">⚠️</div>
          <div>
            <h3 className="font-bold text-red-800 dark:text-red-400">CẢNH BÁO AN TOÀN GIAO DỊCH</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1 leading-relaxed">
              NLU Hub chỉ là nền tảng <b>TRUNG GIAN</b> kết nối sinh viên. Chúng tôi không thu phí và không can thiệp vào giao dịch. 
              Bạn phải <b>TỰ CHỊU TRÁCH NHIỆM</b> kiểm tra kỹ thông tin người bán, chất lượng món đồ trước khi chuyển tiền. 
              Khuyến khích giao dịch trực tiếp!
            </p>
          </div>
        </div>

        {/* Bộ Lọc (Filters) */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar w-full md:w-auto">
            {categories.map(cat => (
              <Link 
                key={cat} 
                href={`/market?category=${cat}`}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                  currentCategory === cat 
                    ? "bg-orange-500 text-white shadow-md" 
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {cat === "All" ? "Tất cả" : cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Danh sách Sản phẩm */}
        {products.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">Chưa có món đồ nào!</h3>
            <p className="text-slate-500 dark:text-slate-400">Hãy là người đầu tiên đăng bán hoặc tặng đồ trong danh mục này nhé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((item: any) => {
              const isSold = item.status === "Đã bán";
              const isFreeItem = item.price === 0;
              const imageUrl = item.imageUrl || getDefaultImage(item.category);

              return (
                <Link 
                  href={`/market/${item._id}`} 
                  key={item._id.toString()}
                  className={`group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 flex flex-col ${isSold ? 'opacity-60 grayscale-[50%]' : ''}`}
                >
                  {/* Ảnh sản phẩm */}
                  <div className="relative aspect-video sm:aspect-square w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Badge Trạng thái */}
                    {isSold && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="bg-red-600 text-white font-black text-xl px-6 py-2 rounded-xl rotate-12 uppercase tracking-widest shadow-2xl border-2 border-red-400">
                          Đã Bán
                        </div>
                      </div>
                    )}
                    {!isSold && isFreeItem && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
                        <span>🎁</span> Tặng Miễn Phí
                      </div>
                    )}
                  </div>

                  {/* Thông tin */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded-md">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        {item.condition}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-1 line-clamp-2 group-hover:text-orange-500 transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="font-black text-xl text-slate-800 dark:text-white">
                        {isFreeItem ? (
                          <span className="text-green-500">0đ</span>
                        ) : (
                          `${item.price.toLocaleString("vi-VN")}đ`
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        ⏱️ {getTimeAgo(new Date(item.createdAt))}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
    </main>
  );
}
