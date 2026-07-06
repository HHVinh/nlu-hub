"use client";

import { useRouter } from "next/navigation";

export default function LostFoundFiltersClient({ 
  currentType, 
  currentCategory 
}: { 
  currentType: string, 
  currentCategory: string 
}) {
  const router = useRouter();
  const categories = ["All", "Giấy tờ tùy thân", "Bóp/Ví", "Chìa khóa", "Đồ điện tử", "Khác"];

  return (
    <>
      <select 
        className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => {
          router.push(`/lost-found?type=${currentType}&category=${e.target.value}`);
        }}
        value={currentCategory}
      >
        {categories.map(c => <option key={c} value={c}>{c === "All" ? "Tất cả Danh mục" : c}</option>)}
      </select>
    </>
  );
}
