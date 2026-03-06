"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SpotlightCard from "@/components/SpotlightCard";

export default function Home() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-24 md:py-32 flex flex-col items-center justify-center text-center">
      <div className="space-y-6 max-w-3xl animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-xs font-mono tracking-widest text-[#8A8F98]">
          <span className="w-2 h-2 rounded-full bg-[#5E6AD2] animate-pulse" />
          SYSTEM V2.0 ONLINE
        </div>

        <h1 className="text-5xl md:text-7xl font-semibold tracking-[-0.03em] leading-[1.1]">
          Decode contracts with <br />
          <span className="text-gradient-accent">pinpoint precision.</span>
        </h1>

        <p className="text-lg md:text-xl text-[#8A8F98] font-normal leading-relaxed max-w-2xl mx-auto">
          Upload any Terms of Service or Legal Contract. Our engine isolates
          predatory clauses and translates them into transparent, human-readable
          English.
        </p>
      </div>

      <div className="w-full max-w-2xl mt-16 animate-reveal delay-200">
        <SpotlightCard
          className={`p-1 transition-colors duration-300 ${isDragging ? "border-[#5E6AD2]/50" : ""}`}
        >
          <div
            className="flex flex-col items-center justify-center py-24 px-8 border border-dashed border-white/10 rounded-xl bg-[#050506]/50 backdrop-blur-sm cursor-pointer group"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              router.push("/analyze");
            }}
            onClick={() => router.push("/analyze")}
          >
            <div className="w-12 h-12 mb-6 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:scale-[0.98] transition-transform duration-300">
              <svg
                className="w-6 h-6 text-[#8A8F98] group-hover:text-[#EDEDEF] transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#EDEDEF] mb-2">
              Drop your document here
            </h3>
            <p className="text-sm text-[#8A8F98]">PDF, DOCX, or paste a URL</p>

            <div className="mt-8 px-6 py-2 rounded-lg bg-[#5E6AD2] text-white text-sm font-medium shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:bg-[#6872D9] transition-all duration-200 hover:scale-[0.98] active:scale-95">
              Select File
            </div>
          </div>
        </SpotlightCard>
      </div>
    </main>
  );
}
