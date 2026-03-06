import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Legalese Translator | Precise Contract Analysis",
  description: "Translate complex terms of service into plain English.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans min-h-screen relative selection:bg-[#5E6AD2]/30 selection:text-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#5E6AD2]/20 blur-[150px] rounded-full animate-float-1" />
          <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full animate-float-2 delay-700" />
        </div>

        <div className="fixed inset-0 bg-grid pointer-events-none z-[-1]" />

        <nav className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#050506]/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#5E6AD2] to-indigo-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]" />
            <span className="font-semibold text-sm tracking-tight text-[#EDEDEF]">
              JargonSlayer
            </span>
          </div>
          <button className="text-sm font-medium text-[#8A8F98] hover:text-[#EDEDEF] transition-colors">
            Documentation
          </button>
        </nav>

        {children}
      </body>
    </html>
  );
}
