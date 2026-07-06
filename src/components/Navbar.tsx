import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LoginButton from "./LoginButton";
import GlobalSearchClient from "./GlobalSearchClient";
import NavTabs from "./NavTabs";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight hidden sm:block">
            NLU <span className="text-amber-500">Hub</span>
          </span>
          <span className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight sm:hidden">
            NLU
          </span>
        </Link>
        
        {/* Thanh Tìm Kiếm Toàn Cục (Nằm Giữa) */}
        <div className="flex-1 max-w-xl mx-4 flex justify-center">
          <GlobalSearchClient />
        </div>

        {/* Nút đăng nhập / Đổi màu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a href="https://forms.gle/BdgcQYh8nc1paoHw6" target="_blank" rel="noopener noreferrer" 
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold hover:bg-amber-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-3.5 sm:h-3.5"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></svg> 
            <span className="hidden sm:inline">Góp ý phát triển</span>
          </a>
          <ThemeSwitcher />
          <LoginButton session={session} />
        </div>
      </div>
      
      {/* Ecosystem Tabs (Nằm dưới Navbar) */}
      <NavTabs />
    </nav>
  );
}
