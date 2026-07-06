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
