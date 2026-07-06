"use client";

import { signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Props = {
  session: any;
};

export default function LoginButton({ session }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (session && session.user) {
    return (
      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 sm:gap-3 p-1 sm:pr-4 rounded-full transition-all focus:outline-none ${isOpen ? 'bg-slate-100 dark:bg-slate-800 shadow-inner' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <img
            src={session.user?.image}
            alt="Avatar"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm object-cover"
          />
          <div className="text-left hidden sm:block">
            <p className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-tight">{session.user?.name}</p>
          </div>
          <svg className={`w-4 h-4 text-slate-400 hidden sm:block transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-3 border-b border-slate-100 dark:border-slate-700 sm:hidden">
               <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{session.user?.name}</p>
               <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session.user?.email}</p>
            </div>
            <Link 
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors font-medium"
            >
              <span>👤</span> Trang Cá Nhân
            </Link>
            <div className="h-px bg-slate-100 dark:bg-slate-700"></div>
            <button
              onClick={() => { setIsOpen(false); signOut(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium text-left"
            >
              <span>🚪</span> Đăng xuất
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-bold shadow-md shadow-amber-500/30 transition-all hover:-translate-y-1"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Đăng nhập bằng Google
    </button>
  );
}
