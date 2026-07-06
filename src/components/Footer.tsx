"use client";

import { useState, useEffect } from 'react';

export default function Footer() {
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        const res = await fetch('https://it-proficiency-backend.onrender.com/api/visits');
        const data = await res.json();
        setVisitCount(data.count);
      } catch (error) { 
        console.error("Lỗi lấy lượt truy cập:", error); 
      }
    };
    fetchVisit();
  }, []);

  return (
    <footer className="py-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center gap-1.5 text-center text-[15px]">
        
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span><span className="font-extrabold text-slate-800 dark:text-white tracking-tight">NLU <span className="text-amber-500">Hub</span></span> đã phục vụ <strong>{visitCount}</strong> lượt truy cập học tập</span>
        </div>
        
        <div className="text-slate-600 dark:text-slate-400">
          Được phát triển bởi <a href="https://www.facebook.com/HuynhHuuVinh2101" target="_blank" rel="noopener noreferrer" className="font-bold text-amber-500 hover:text-amber-400 transition-colors">Huỳnh Hữu Vinh</a>
        </div>

        <div className="text-slate-500 dark:text-slate-500 italic">
          © {new Date().getFullYear()} NLU Hub - Dự án phi lợi nhuận hỗ trợ Sinh viên Nông Lâm
        </div>

        <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800/50 max-w-2xl text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
          <strong>Lưu ý:</strong> NLU Hub là nền tảng chia sẻ học thuật độc lập do sinh viên tự xây dựng và vận hành. Dự án này hoàn toàn không trực thuộc quản lý và không đại diện cho tiếng nói chính thức của trường Đại học Nông Lâm TP.HCM.
        </div>
      </div>
    </footer>
  );
}
