import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NLU Hub",
  description: "NLU Hub - Nền tảng hỗ trợ học tập của sinh viên Nông Lâm. Nơi chia sẻ giáo trình, đề thi, thảo luận học tập và kết nối sinh viên Đại học Nông Lâm TP.HCM (NLU).",
  keywords: ["NLU", "NLU Hub", "Đại học Nông Lâm", "Tài liệu NLU", "Giáo trình NLU", "Chợ sinh viên NLU", "Đồ thất lạc NLU"],
  openGraph: {
    title: "NLU Hub",
    description: "Nền tảng chia sẻ tài liệu và kết nối sinh viên Đại học Nông Lâm TP.HCM.",
    url: "https://nluhub.vercel.app", // Thay bằng domain thật sau này
    siteName: "NLU Hub",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            {children}
            <Footer />
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
