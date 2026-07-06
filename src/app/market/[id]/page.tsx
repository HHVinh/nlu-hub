import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import MarketActionButtons from "./MarketActionButtons";
import { getDefaultImage } from "../page";
import UserProfile from "@/models/UserProfile";
import Review from "@/models/Review";
import ReviewSellerClient from "./ReviewSellerClient";
import ReportSellerClient from "./ReportSellerClient";

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

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  const userEmail = session?.user?.email || "";
  const isAdmin = userEmail === process.env.ADMIN_EMAIL;

  const product = await Product.findById(id).lean();

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Không tìm thấy món đồ!</h1>
        <Link href="/market" className="text-blue-500 mt-4 hover:underline">⬅ Quay lại Chợ</Link>
      </div>
    );
  }

  const isSold = product.status === "Đã bán";
  const isFreeItem = product.price === 0;
  const imageUrl = product.imageUrl || getDefaultImage(product.category);
  const isAuthor = userEmail === product.authorEmail;

  // Xử lý Link Liên hệ Thông minh và Ẩn nếu chưa đăng nhập
  const isLoggedIn = !!session?.user;
  let contactUrl = isLoggedIn ? product.contactInfo : "/api/auth/signin";
  let contactLabel = isLoggedIn ? "Sẽ mở Zalo / Facebook của người bán" : "Đăng nhập để xem Liên hệ";
  
  if (isLoggedIn) {
    // Nếu chỉ toàn số và độ dài khoảng 10-11 số (SĐT), chuyển thành link Zalo
    const phoneRegex = /^[0-9]{10,11}$/;
    if (phoneRegex.test(product.contactInfo.replace(/[^0-9]/g, ''))) {
      const cleanPhone = product.contactInfo.replace(/[^0-9]/g, '');
      contactUrl = `https://zalo.me/${cleanPhone}`;
      contactLabel = `Zalo (${cleanPhone})`;
    } else if (!product.contactInfo.startsWith("http")) {
      contactUrl = `tel:${product.contactInfo}`;
      contactLabel = `Gọi (${product.contactInfo})`;
    }
  }

  // Lấy UserProfile của người đang xem để cấp quyền Review
  let viewerProfile = null;
  if (userEmail) {
    viewerProfile = await UserProfile.findOne({ email: userEmail }).lean();
  }

  // Lấy Uy tín của Người bán (Từ Profile)
  const sellerProfile = await UserProfile.findOne({ email: product.authorEmail }).lean();
  const averageRating = sellerProfile?.averageRating || 0;
  const totalReviews = sellerProfile?.totalReviews || 0;

  // Lấy Danh sách Đánh giá của Người bán
  const reviews = await Review.find({ sellerEmail: product.authorEmail }).sort({ createdAt: -1 }).lean();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Nút Back */}
        <Link href="/market" className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors mb-6 font-medium">
          <span>⬅</span> Quay lại Chợ Sinh Viên
        </Link>

        {isSold && (
          <div className="bg-red-500 text-white font-bold p-4 rounded-xl mb-6 text-center shadow-lg animate-pulse">
            ❌ Món đồ này đã được BÁN hoặc TẶNG XONG!
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row">
          
          {/* Cột Trái: Hình Ảnh */}
          <div className="w-full lg:w-1/2 bg-slate-100 dark:bg-slate-800 relative">
            <div className="aspect-square w-full relative">
              <img 
                src={imageUrl} 
                alt={product.title}
                className={`w-full h-full object-cover ${isSold ? 'grayscale' : ''}`}
              />
              {isFreeItem && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-400 text-white text-sm font-black px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 border-2 border-white/20">
                  <span>🎁</span> TẶNG MIỄN PHÍ
                </div>
              )}
            </div>
          </div>

          {/* Cột Phải: Thông tin chi tiết */}
          <div className="w-full lg:w-1/2 p-6 md:p-10 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100 dark:bg-orange-500/20 px-3 py-1.5 rounded-lg">
                {product.category}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                Tình trạng: {product.condition}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mb-2 leading-tight">
              {product.title}
            </h1>
            
            <div className="text-sm text-slate-400 mb-6 flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="flex items-center gap-2">
                Đăng {getTimeAgo(new Date(product.createdAt))} bởi 
                <span className="font-bold text-slate-600 dark:text-slate-300 text-base">{product.authorName}</span>
              </div>
              
              {/* Box Uy Tín */}
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1 text-yellow-500 font-bold">
                  <span className="text-xl">⭐</span> {averageRating} <span className="text-slate-400 font-normal text-xs">/ 5</span>
                </div>
                <div className="text-slate-500 text-xs font-bold">
                  ({totalReviews} đánh giá)
                </div>
                <div className="flex items-center gap-2">
                  <ReviewSellerClient 
                    sellerEmail={product.authorEmail}
                    isLoggedIn={!!userEmail}
                    hasPhoneNumber={!!viewerProfile?.phoneNumber}
                    isBanned={viewerProfile?.isBanned || false}
                  />
                  {!isAuthor && (
                    <ReportSellerClient 
                      accusedEmail={product.authorEmail}
                      productUrl={`/market/${id}`}
                      isLoggedIn={!!userEmail}
                      hasPhoneNumber={!!viewerProfile?.phoneNumber}
                      isBanned={viewerProfile?.isBanned || false}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Mô tả món đồ:</div>
              <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-lg">
                {product.description}
              </div>
            </div>

            <div className="mt-auto">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Giá bán:</div>
                <div className="text-4xl font-black text-slate-800 dark:text-white">
                  {isFreeItem ? (
                    <span className="text-green-500">Miễn phí (Cho/Tặng)</span>
                  ) : (
                    <span className="text-orange-500">{product.price.toLocaleString("vi-VN")} đ</span>
                  )}
                </div>
              </div>

              {!isSold && (
                <a 
                  href={contactUrl}
                  target={isLoggedIn ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="w-full block text-center py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  💬 {isLoggedIn ? "Liên Hệ Người Bán Ngay" : "Đăng nhập để xem Liên hệ"}
                </a>
              )}
              {!isSold && (
                <div className="text-center text-sm text-slate-500 mt-3 font-medium">
                  {contactLabel}
                </div>
              )}

              {/* Nút Dành riêng cho Tác giả / Admin */}
              {(isAuthor || isAdmin) && (
                <MarketActionButtons productId={id} currentStatus={product.status} />
              )}
            </div>
          </div>
        </div>

        {/* Khu vực Đánh giá Khách hàng (Reviews) */}
        {reviews.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <span>⭐</span> Đánh giá từ người mua trước ({totalReviews})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev: any) => (
                <div key={rev._id.toString()} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-slate-700 dark:text-slate-200">{rev.reviewerName}</div>
                    <div className="text-xs text-slate-400">{getTimeAgo(new Date(rev.createdAt))}</div>
                  </div>
                  <div className="text-yellow-400 text-sm mb-3">
                    {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
