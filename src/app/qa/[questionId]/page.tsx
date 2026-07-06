import connectDB from "@/lib/db";
import Question from "@/models/Question";
import Answer from "@/models/Answer";
import UserProfile from "@/models/UserProfile";
import Link from "next/link";
import SubmitAnswerClient from "./SubmitAnswerClient";
import FollowButtonClient from "./FollowButtonClient";
import DeleteQuestionButton from "./DeleteQuestionButton";
import DeleteAnswerButton from "./DeleteAnswerButton";
import ReplyButtonClient from "./ReplyButtonClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

export default async function QuestionDetailPage({ params }: { params: Promise<{ questionId: string }> }) {
  await connectDB();
  const { questionId } = await params;
  const session = await getServerSession(authOptions);
  
  const userEmail = session?.user?.email || "";
  const isAdmin = userEmail === process.env.ADMIN_EMAIL;
  
  // Gọi database trực tiếp để lấy dữ liệu thay vì gọi qua Fetch API nội bộ để tối ưu tốc độ render Next.js
  const question = await Question.findByIdAndUpdate(
    questionId,
    { $inc: { views: 1 } },
    { returnDocument: 'after' } // Mongoose version mới yêu cầu dùng thuộc tính này thay cho { new: true }
  );

  if (!question) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Không tìm thấy câu hỏi!</h1>
        <Link href="/qa" className="text-blue-500 hover:underline">Quay lại diễn đàn</Link>
      </div>
    );
  }

  let isBanned = false;
  let isFollowed = false;
  const isLoggedIn = !!session;
  
  if (session?.user?.email) {
    const userProfile = await UserProfile.findOne({ email: session.user?.email }).lean();
    isBanned = userProfile?.isBanned || false;
    isFollowed = (question.followers || []).includes(session.user?.email);
  }

  const answers = await Answer.find({ questionId }).sort({ createdAt: 1 });

  return (
    <main className="flex flex-col py-10 px-4 max-w-4xl mx-auto w-full flex-grow font-[family-name:var(--font-geist-sans)]">
      {/* Nút Quay lại */}
      <Link href="/qa" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6 font-medium w-fit">
        <span>⬅️</span> Quay lại Diễn đàn
      </Link>

      {/* Vùng Bài viết Gốc */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
            {question.title}
          </h1>
          {/* Nút Theo dõi chỉ hiện khi đã đăng nhập và không phải là tác giả */}
          {session?.user?.email && session.user?.email !== question.authorEmail && (
            <FollowButtonClient 
              questionId={questionId} 
              isFollowed={isFollowed} 
              isLoggedIn={isLoggedIn} 
              isBanned={isBanned} 
            />
          )}
        </div>
        
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg shadow-inner shrink-0">
            {question.authorName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-bold text-slate-700 dark:text-slate-200">{question.authorName}</div>
            <div className="text-sm text-slate-400 flex items-center gap-2">
              Đã đăng {getTimeAgo(new Date(question.createdAt))} • 👁️ {question.views} lượt xem
            </div>
          </div>
          
          {/* Nút Xóa bài viết (Chỉ hiện cho Tác giả hoặc Admin) */}
          {(isAdmin || userEmail === question.authorEmail) && (
            <div className="shrink-0">
              <DeleteQuestionButton questionId={questionId} />
            </div>
          )}
        </div>

        <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-lg">
          {question.content}
        </div>

        {question.tags && question.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {question.tags.map((tag: string, idx: number) => (
               <span key={idx} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-800/50">
                 #{tag}
               </span>
            ))}
          </div>
        )}
      </div>

      {/* Vùng Câu trả lời */}
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {answers.length} Câu trả lời
        </h2>
      </div>

      <div className="flex flex-col gap-5">
        {answers.map((ans: any) => (
          <div key={ans._id.toString()} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm">
                {ans.authorName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2">
                  {ans.authorName} 
                  <span className="text-xs text-slate-400 font-normal">• {getTimeAgo(new Date(ans.createdAt))}</span>
                </div>
              </div>
              
              {/* Nút Hành động (Trả lời & Xóa) */}
              <div className="shrink-0 flex items-center">
                <ReplyButtonClient authorName={ans.authorName} />
                
                {(isAdmin || userEmail === ans.authorEmail) && (
                  <DeleteAnswerButton questionId={questionId} answerId={ans._id.toString()} />
                )}
              </div>
            </div>
            <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed pl-11">
              {ans.content}
            </div>
          </div>
        ))}
      </div>

      {/* Form Trả lời */}
      <SubmitAnswerClient questionId={questionId} isLoggedIn={isLoggedIn} isBanned={isBanned} />
      
    </main>
  );
}
