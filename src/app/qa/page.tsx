import connectDB from "@/lib/db";
import Question from "@/models/Question";
import UserProfile from "@/models/UserProfile";
import AskQuestionClient from "./AskQuestionClient";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { timeAgo } from "@/lib/utils"; // Giả sử ta có hàm timeAgo, nếu chưa có ta sẽ viết thẳng một hàm đơn giản

// Hàm tính thời gian trôi qua (vd: "2 giờ trước")
function getTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  return "Vừa xong";
}

export default async function QAPage() {
  await connectDB();
  const session = await getServerSession(authOptions);
  let isBanned = false;
  if (session?.user?.email) {
    const userProfile = await UserProfile.findOne({ email: session.user.email }).lean();
    isBanned = userProfile?.isBanned || false;
  }
  
  // Dùng Aggregation để đếm số lượng trả lời cho mỗi câu hỏi
  const questions = await Question.aggregate([
    {
      $lookup: {
        from: "answers",
        localField: "_id",
        foreignField: "questionId",
        as: "answersData"
      }
    },
    {
      $addFields: { answerCount: { $size: "$answersData" } }
    },
    {
      $project: { answersData: 0 }
    },
    { $sort: { createdAt: -1 } }
  ]);

  return (
    <main className="flex flex-col py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full flex-grow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <span className="text-4xl">💬</span> Diễn đàn Hỏi Đáp
          </h1>
          <p className="text-slate-500 mt-2">Nơi giải đáp thắc mắc học vụ, tín chỉ và kinh nghiệm học tập. (Tối đa 5 bài/ngày)</p>
        </div>
        <AskQuestionClient isLoggedIn={!!session} isBanned={isBanned} />
      </div>

      {/* Banner Cảnh Báo Pháp Lý */}
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm mb-8 flex items-start gap-4">
        <div className="text-red-500 text-2xl">⚠️</div>
        <div>
          <h3 className="font-bold text-red-800 dark:text-red-400">QUY ĐỊNH DIỄN ĐÀN</h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1 leading-relaxed">
            Mọi thông tin trao đổi trên diễn đàn là quan điểm cá nhân của người đăng. NLU Hub <b>KHÔNG CHỊU TRÁCH NHIỆM</b> về tính xác thực của thông tin. Tuyệt đối nghiêm cấm các hành vi công kích cá nhân, xúc phạm danh dự, hoặc đăng tải nội dung vi phạm pháp luật. Quản trị viên có quyền <b>XÓA BÀI VÀ KHÓA TÀI KHOẢN</b> vĩnh viễn không cần báo trước.
          </p>
        </div>
      </div>

      {/* Danh sách câu hỏi */}
      <div className="flex flex-col gap-4">
        {questions.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
            <div className="text-6xl mb-4 opacity-50">🤷‍♂️</div>
            <p className="text-xl font-bold text-slate-700 dark:text-slate-300">Chưa có câu hỏi nào</p>
            <p className="text-slate-500 mt-2">Hãy là người đầu tiên đặt câu hỏi cho cộng đồng!</p>
          </div>
        ) : (
          questions.map((q: any) => (
            <Link href={`/qa/${q._id}`} key={q._id.toString()} className="block group">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all flex flex-col sm:flex-row gap-6">
                
                {/* Stats (Bên trái) */}
                <div className="flex sm:flex-col gap-4 sm:gap-2 text-sm sm:w-24 shrink-0 justify-start sm:justify-center items-center sm:items-end text-slate-500">
                  <div className={`flex flex-col items-center p-2 rounded-xl border ${q.answerCount > 0 ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' : 'border-transparent'}`}>
                    <span className="font-bold text-lg">{q.answerCount}</span>
                    <span className="text-[11px] uppercase tracking-wider">Trả lời</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>👁️</span> {q.views}
                  </div>
                </div>

                {/* Content (Bên phải) */}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                    {q.title}
                  </h2>
                  <p className="text-slate-500 line-clamp-2 text-sm mb-4">
                    {q.content}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {q.tags.map((tag: string, index: number) => (
                         <span key={index} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700">
                           {tag}
                         </span>
                      ))}
                    </div>
                    
                    {/* Author & Time */}
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold">
                        {q.authorName.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-medium text-slate-600 dark:text-slate-400">{q.authorName}</span>
                      <span>•</span>
                      <span>{getTimeAgo(new Date(q.createdAt))}</span>
                    </div>
                  </div>
                </div>
                
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
