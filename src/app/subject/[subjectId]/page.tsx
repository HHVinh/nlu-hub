import connectDB from "@/lib/db";
import Subject from "@/models/Subject";
import Document from "@/models/Document";
import Link from "next/link";
import UploadWidgetClient from "./UploadWidgetClient";
import AddLinkClient from "./AddLinkClient";
import DocumentCardClient from "./DocumentCardClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SubscribeButtonClient from "./SubscribeButtonClient";

export default async function SubjectPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const resolvedParams = await params;
  const { subjectId } = resolvedParams;

  const session = await getServerSession(authOptions);
  
  await connectDB();
  
  // 1. Lấy thông tin môn học
  const subject = await Subject.findById(subjectId);
  if (!subject) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500">Không tìm thấy môn học!</h1>
      </div>
    );
  }

  // 2. Lấy danh sách tài liệu của môn này (Mới nhất lên đầu)
  const rawDocs = await Document.find({ subjectId }).sort({ createdAt: -1 });
  const documents = rawDocs.map(doc => ({
    _id: doc._id.toString(),
    title: doc.title,
    url: doc.url,
    type: doc.type,
    uploaderName: doc.uploaderName,
    uploaderEmail: doc.uploaderEmail,
    createdAt: doc.createdAt.toLocaleDateString('vi-VN'),
  }));

  return (
    <main className="flex flex-col py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full flex-grow">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <Link href={`/faculty/${subject.faculty}`} className="text-4xl hover:-translate-x-2 transition-transform opacity-70 hover:opacity-100" title="Quay lại">
          ⬅️
        </Link>
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">📚 {subject.name}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {subject.note ? `Ghi chú: ${subject.note}` : "Chưa có ghi chú cho môn này."}
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-start">
            <SubscribeButtonClient subjectId={subjectId} defaultEmail={session?.user?.email || ""} />
          </div>
        </div>
      </div>

      {/* Banner Đặc biệt: Môn Tin Học Đại Cương */}
      {subject.name === "Tin Học Đại Cương" && (
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800/50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <h3 className="font-bold text-blue-800 dark:text-blue-300 text-lg">BẠN ĐANG HỌC MÔN NÀY?</h3>
          </div>
          <a 
            href="https://tinhoc-nlu.vercel.app/" 
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-white text-slate-900 hover:bg-slate-50 font-bold py-2.5 px-6 rounded-full shadow-md transition-all hover:-translate-y-0.5 text-sm w-full sm:w-auto text-center flex items-center gap-2 justify-center"
          >
            Học ngay 🚀
          </a>
        </div>
      )}

      {/* Box Upload */}
      <div className="mb-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Đóng góp tài liệu</h3>
          <p className="text-sm text-slate-500">Tải lên Đề thi, Giáo trình hoặc Bài tập để giúp đỡ các thế hệ sau nhé! (Tối đa 20 tài liệu/ngày)</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <AddLinkClient 
            subjectId={subjectId} 
            user={session?.user ? { name: session.user.name, email: session.user.email } : null} 
          />
          <UploadWidgetClient 
            subjectId={subjectId} 
            user={session?.user ? { name: session.user.name, email: session.user.email } : null} 
          />
        </div>
      </div>

      {/* Danh sách Tài liệu */}
      <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100 border-l-4 border-amber-500 pl-3">
        Tài liệu mới nhất ({documents.length})
      </h2>

      {documents.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="text-5xl mb-4 opacity-50">📂</div>
          <p className="text-slate-500 text-lg">Môn này chưa có tài liệu nào.</p>
          <p className="text-slate-400 text-sm mt-1">Hãy là người hùng đầu tiên đóng góp nhé!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {documents.map((doc) => (
            <DocumentCardClient 
              key={doc._id} 
              doc={doc} 
              currentUserEmail={session?.user?.email || null}
              adminEmail={process.env.ADMIN_EMAIL || null}
            />
          ))}
        </div>
      )}
    </main>
  );
}
