import Link from "next/link";
import { FACULTIES, GENERAL_SUBJECTS } from "@/lib/constants";
import connectDB from "@/lib/db";
import Subject from "@/models/Subject";

export default async function Home() {
  await connectDB();

  // Lấy tất cả môn học (chỉ lấy field name và faculty)
  const allSubjects = await Subject.find({}, "name faculty").lean();

  // Nhóm môn học theo faculty ID
  const subjectsByFaculty: Record<string, string[]> = {};
  allSubjects.forEach((sub: any) => {
    if (!subjectsByFaculty[sub.faculty]) {
      subjectsByFaculty[sub.faculty] = [];
    }
    subjectsByFaculty[sub.faculty].push(sub.name);
  });

  // Hàm tạo description động
  const buildDescription = (facultyId: string, fallbackDesc: string) => {
    const subjects = subjectsByFaculty[facultyId] || [];
    if (subjects.length === 0) return fallbackDesc; // Nếu chưa có môn nào thì dùng mô tả tĩnh mặc định
    
    const displayNames = subjects.slice(0, 3); // Lấy tối đa 3 môn học đầu tiên
    let text = displayNames.join(", ");
    if (subjects.length > 3) text += "...";
    return text;
  };

  const dynamicGeneralSubjects = GENERAL_SUBJECTS.map(f => ({ ...f, description: buildDescription(f.id, f.description) }));
  const dynamicFaculties = FACULTIES.map(f => ({ ...f, description: buildDescription(f.id, f.description) }));

  return (
    <main className="flex flex-col items-center py-12 px-4 font-[family-name:var(--font-geist-sans)] flex-grow">
      {/* Main Content: Lưới danh sách các Khoa */}
      <div className="max-w-6xl w-full">
        
        {/* Banner Giới thiệu (Hero Banner) */}
        <div className="mb-10 sm:mb-14 relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900 border border-blue-100/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
          {/* Background decorative glowing orbs */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-5 max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              Kho Tài Liệu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Sinh Viên Nông Lâm</span>
            </h1>
            
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed w-full">
              Bạn đang giữ những tài liệu quý giá hay đề thi cũ? Hãy <strong>đóng góp (Upload)</strong> để tiếp sức cho đàn em! 
              <br />
              Hoặc nếu đang cần ôn thi, bạn có thể dễ dàng <strong>tìm và tải về (Download)</strong> kho tri thức từ cộng đồng NLU Hub.
            </p>
  
            {/* Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold border border-blue-200 dark:border-blue-800/30 transition-transform hover:scale-105 cursor-default">
                📚 Hàng ngàn tài liệu
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold border border-emerald-200 dark:border-emerald-800/30 transition-transform hover:scale-105 cursor-default">
                🆓 Miễn phí 100%
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs sm:text-sm font-semibold border border-amber-200 dark:border-amber-800/30 transition-transform hover:scale-105 cursor-default">
                🤝 Cộng đồng đóng góp
              </span>
            </div>
          </div>
        </div>

        {/* Khu vực 1: Chuẩn đầu ra & Đại cương */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-slate-100 uppercase tracking-wide border-b-2 border-amber-500 pb-2 inline-block">
            📌 Chuẩn Đầu Ra & Đại Cương
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dynamicGeneralSubjects.map((faculty) => (
              <Link href={`/faculty/${faculty.id}`} key={faculty.id} className="block h-full">
                <div className={`h-full p-6 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 group`}>
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">{faculty.icon}</div>
                  <h3 className={`text-xl font-extrabold mb-2 ${faculty.color}`}>{faculty.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{faculty.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Khu vực 2: Khoa chuyên ngành */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-slate-100 uppercase tracking-wide border-b-2 border-blue-500 pb-2 inline-block">
            🎓 Khoa Chuyên Ngành
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dynamicFaculties.map((faculty) => (
              <Link href={`/faculty/${faculty.id}`} key={faculty.id} className="block h-full">
                <div className={`h-full p-6 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 group`}>
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">{faculty.icon}</div>
                  <h3 className={`text-lg font-bold mb-2 ${faculty.color}`}>{faculty.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{faculty.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
