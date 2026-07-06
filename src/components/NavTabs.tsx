"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavTabs() {
  const pathname = usePathname();

  const tabs = [
    { name: "📚 Tài Liệu", path: "/" },
    { name: "💬 Hỏi Đáp", path: "/qa" },
    { name: "🛒 Chợ Sinh Viên", path: "/market" },
    { name: "🔍 Đồ Thất Lạc", path: "/lost-found" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 w-full flex items-center justify-between sm:justify-start gap-2 sm:gap-6 overflow-x-auto no-scrollbar border-t border-slate-100 dark:border-slate-800/50 pt-2 pb-2">
      {tabs.map((tab) => {
        // Active if exact match for home, or if pathname starts with the tab path (for others)
        const isActive = tab.path === "/" 
          ? pathname === "/" || pathname.startsWith("/faculty") || pathname.startsWith("/subject")
          : pathname.startsWith(tab.path);

        return (
          <Link
            key={tab.path}
            href={tab.path}
            className={`whitespace-nowrap pb-1 border-b-2 font-medium text-[11px] sm:text-sm transition-colors ${
              isActive
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
