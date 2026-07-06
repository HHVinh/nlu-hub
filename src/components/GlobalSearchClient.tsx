"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SearchResult {
  _id: string;
  name: string;
  icon: string;
  type: string;
  url: string;
}

interface SearchResponse {
  faculties: SearchResult[];
  subjects: SearchResult[];
  documents: SearchResult[];
  questions: SearchResult[];
}

export default function GlobalSearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Xử lý Click ra ngoài thì đóng hộp Search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý Gõ phím (Tích hợp Debounce chống spam API)
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.results);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      } finally {
        setIsLoading(false);
      }
    }, 400); // Đợi người dùng ngưng gõ 0.4s mới gọi API

    return () => clearTimeout(timer);
  }, [query]);

  const hasResults = results && (results.faculties.length > 0 || results.subjects.length > 0 || results.documents.length > 0 || results.questions?.length > 0 || results.lostItems?.length > 0);

  return (
    <div className="relative w-full max-w-md mx-4" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim()) setIsOpen(true) }}
          placeholder="Tìm kiếm môn học, tài liệu..."
          className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {isLoading ? "⏳" : "🔍"}
        </div>
        {query && (
          <button 
            onClick={() => { setQuery(""); setResults(null); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown Kết quả */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[80vh] overflow-y-auto z-50">
          {!isLoading && !hasResults && query.trim() && (
            <div className="p-4 text-center text-slate-500 text-sm">
              Không tìm thấy kết quả nào cho &quot;{query}&quot;
            </div>
          )}

          {results?.faculties.length ? (
            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Khoa</h4>
              {results.faculties.map((item) => (
                <Link 
                  key={item._id} 
                  href={item.url}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                </Link>
              ))}
            </div>
          ) : null}

          {results?.subjects.length ? (
            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Môn Học</h4>
              {results.subjects.map((item) => (
                <Link 
                  key={item._id} 
                  href={item.url}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                </Link>
              ))}
            </div>
          ) : null}

          {results?.documents.length ? (
            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Tài Liệu</h4>
              {results.documents.map((item) => (
                <Link 
                  key={item._id} 
                  href={item.url}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{item.name}</span>
                </Link>
              ))}
            </div>
          ) : null}

          {results?.questions?.length ? (
            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Hỏi Đáp</h4>
              {results.questions.map((item) => (
                <Link 
                  key={item._id} 
                  href={item.url}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{item.name}</span>
                </Link>
              ))}
            </div>
          ) : null}

          {results?.lostItems?.length ? (
            <div className="p-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Đồ Thất Lạc</h4>
              {results.lostItems.map((item) => (
                <Link 
                  key={item._id} 
                  href={item.url}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{item.name}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
