import connectDB from "@/lib/db";
import Subject from "@/models/Subject";
import { FACULTIES, GENERAL_SUBJECTS } from "@/lib/constants";
import AddSubjectClient from "./AddSubjectClient";
import SubjectCardClient from "./SubjectCardClient";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function FacultyPage({ params }: { params: Promise<{ facultyId: string }> }) {
  // Trong Next.js 15, params là một Promise
  const resolvedParams = await params;
  const { facultyId } = resolvedParams;

  // 1. Lấy thông tin Khoa từ constants (Gộp cả 2 mảng)
  const allCategories = [...GENERAL_SUBJECTS, ...FACULTIES];
  const faculty = allCategories.find((f) => f.id === facultyId);
  
  if (!faculty) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500">Không tìm thấy Khoa này!</h1>
      </div>
    );
  }

  // 2. Kết nối DB và lấy danh sách môn học (Server Component query thẳng DB cho lẹ)
  await connectDB();
  const rawSubjects = await Subject.find({ faculty: facultyId }).sort({ name: 1 });
  
  // Convert MongoDB Document sang Object thuần để truyền xuống Client Component
  const subjects = rawSubjects.map((sub) => ({
    _id: sub._id.toString(),
    name: sub.name,
    note: sub.note,
  }));

  // Kiểm tra quyền Admin
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.email === "vinh0986585015@gmail.com";

  return (
    <main className="flex flex-col py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full flex-grow">
      {/* Header của Khoa */}
      <div className="mb-8 flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <Link href="/" className="text-4xl hover:-translate-x-2 transition-transform opacity-70 hover:opacity-100" title="Quay lại Trang chủ">
          ⬅️
        </Link>
        <div className="text-6xl">{faculty.icon}</div>
        <div>
          <h1 className={`text-3xl font-extrabold ${faculty.color}`}>{faculty.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {facultyId === "tin-hoc" 
              ? "Vui lòng truy cập Website NLU Hub | IT Learning bên dưới để học và ôn thi chuẩn đầu ra Tin học."
              : "Chọn môn học bên dưới hoặc thêm môn mới nếu chưa có."}
          </p>
        </div>
      </div>

      {/* Banner Đặc biệt: Hệ sinh thái Hỗ trợ học tập Tin học */}
      {facultyId === "tin-hoc" && (
        <div className="bg-slate-900 rounded-3xl shadow-xl mb-8 overflow-hidden relative p-8 sm:p-12 text-center border border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-br from-green-950/40 via-slate-900 to-blue-950/30" />
          
          <div className="relative z-10 flex flex-col items-center">
            <h1 className="font-black text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Chuẩn Đầu Ra <br/>
              <span className="bg-gradient-to-r from-green-500 via-emerald-400 to-green-300 bg-clip-text text-transparent">
                Tin Học Nông Lâm
              </span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mb-8">
              Chia sẻ kiến thức, tài liệu và video ôn tập thi chuẩn đầu ra Tin học miễn phí
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl px-5 py-3 flex items-center gap-2 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
                  <rect width="20" height="14" x="2" y="3" rx="2" />
                  <line x1="8" x2="16" y1="21" y2="21" />
                  <line x1="12" x2="12" y1="17" y2="21" />
                </svg>
                <div className="text-left">
                  <div className="font-bold text-sm">Tin A (Phần 1)</div>
                  <div className="text-[10px] opacity-80">Word, PowerPoint & Excel</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl px-5 py-3 flex items-center gap-2 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M8 13h2" />
                  <path d="M8 17h2" />
                  <path d="M14 13h2" />
                  <path d="M14 17h2" />
                </svg>
                <div className="text-left">
                  <div className="font-bold text-sm">Tin B (Phần 2)</div>
                  <div className="text-[10px] opacity-80">Excel nâng cao</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-700 text-white rounded-xl px-5 py-3 flex items-center gap-2 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                  <path d="M3 12A9 3 0 0 0 21 12" />
                </svg>
                <div className="text-left">
                  <div className="font-bold text-sm">Access</div>
                  <div className="text-[10px] opacity-80">Quản trị CSDL</div>
                </div>
              </div>
            </div>

            <a 
              href="https://tinhoc-nlu.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-slate-900 font-bold py-3 px-8 rounded-full shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl flex items-center gap-2 text-lg"
            >
              Học ngay 🚀
            </a>
          </div>
        </div>
      )}

      {/* Hiển thị các phần dưới nếu không phải là Khoa Tin Học */}
      {facultyId !== "tin-hoc" && (
        <>
          {/* Banner Cảnh Báo Bản Quyền & Bảo Mật */}
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm mb-8 flex items-start gap-4">
        <div className="text-red-500 text-2xl">⚠️</div>
        <div>
          <h3 className="font-bold text-red-800 dark:text-red-400">CẢNH BÁO BẢN QUYỀN & BẢO MẬT</h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1 leading-relaxed">
            NLU Hub chỉ là nền tảng lưu trữ, tài liệu do cộng đồng tự đóng góp. Sinh viên <b>TỰ CHỊU TRÁCH NHIỆM</b> về vấn đề bản quyền sở hữu trí tuệ của tài liệu mình tải lên. Tuyệt đối <b>KHÔNG</b> chia sẻ các tệp tin chứa thông tin cá nhân nhạy cảm, đề thi bảo mật của trường hoặc mã độc.
          </p>
        </div>
      </div>

      {/* Nút thêm môn học (Client Component để gọi API POST) */}
      <div className="mb-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Không tìm thấy môn bạn cần?</h3>
          <p className="text-sm text-slate-500">Hãy giúp cộng đồng bằng cách tự tạo môn học mới nhé!</p>
        </div>
        <AddSubjectClient facultyId={facultyId} />
      </div>

      {/* Danh sách môn học */}
      {subjects.length === 0 ? (
        <div className="text-center py-12 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-slate-500 text-lg">Khoa này chưa có môn học nào được cập nhật.</p>
          <p className="text-slate-400 text-sm mt-1">Hãy là người đầu tiên tạo môn học!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => (
            <SubjectCardClient key={sub._id} subject={sub} isAdmin={isAdmin} />
          ))}
        </div>
      )}
      </>
      )}
    </main>
  );
}
