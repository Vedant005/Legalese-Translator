"use client";
import { useEffect, useState } from "react";
import SpotlightCard from "@/components/SpotlightCard";

const MOCK_DATA = [
  {
    id: 1,
    original:
      "User grants Company a perpetual, irrevocable, worldwide, royalty-free, and non-exclusive license to reproduce, adapt, modify, translate, publish, publicly perform, publicly display and distribute any Content...",
    eli5: "We own your pictures forever. We can sell them, change them, and use them in ads without paying you.",
    severity: "critical",
  },
  {
    id: 2,
    original:
      "The Company reserves the right, at its sole discretion, to modify or replace these Terms at any time without prior notice...",
    eli5: "We can change the rules at any time, and we aren't required to tell you.",
    severity: "warning",
  },
];

export default function AnalyzePage() {
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setAnalyzing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (analyzing) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#5E6AD2] w-1/2 animate-[slideRight_1s_ease-in-out_infinite_alternate] shadow-[0_0_12px_rgba(94,106,210,0.8)]" />
        </div>
        <p className="font-mono text-xs tracking-widest text-[#8A8F98] animate-pulse">
          EXTRACTING CLAUSES...
        </p>
      </div>
    );
  }

  return (
    <main className="max-w-[1400px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <section className="lg:col-span-5 flex flex-col gap-4 animate-reveal">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h2 className="text-sm font-mono tracking-widest text-[#8A8F98]">
            SOURCE_DOCUMENT.PDF
          </h2>
        </div>

        <SpotlightCard className="p-6 h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="font-mono text-sm leading-relaxed text-[#8A8F98] space-y-6">
            <p>
              1.1 By accessing or using the Service, you agree to be bound by
              these Terms.
            </p>
            <p className="bg-[#5E6AD2]/10 text-[#EDEDEF] p-2 rounded border border-[#5E6AD2]/20">
              1.2 {MOCK_DATA[0].original}
            </p>
            <p>
              1.3 Furthermore, you agree to indemnify, defend and hold harmless
              the Company...
            </p>
            <p className="bg-white/5 text-[#EDEDEF] p-2 rounded border border-white/10">
              1.4 {MOCK_DATA[1].original}
            </p>
          </div>
        </SpotlightCard>
      </section>

      <section className="lg:col-span-7 flex flex-col gap-4 animate-reveal delay-100">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h2 className="text-sm font-mono tracking-widest text-[#8A8F98]">
            ANALYSIS_RESULTS
          </h2>
          <button className="text-xs font-medium px-3 py-1 rounded bg-white/[0.05] hover:bg-white/[0.08] transition-colors border border-white/10">
            Export Report
          </button>
        </div>

        <div className="space-y-4">
          {MOCK_DATA.map((clause, idx) => (
            <SpotlightCard key={clause.id} className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${clause.severity === "critical" ? "bg-[#5E6AD2] shadow-[0_0_8px_rgba(94,106,210,0.8)]" : "bg-white/40"}`}
                />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-[#EDEDEF] leading-tight">
                    {clause.eli5}
                  </h3>
                  <p className="text-sm text-[#8A8F98] leading-relaxed">
                    Original: "{clause.original.substring(0, 80)}..."
                  </p>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>
    </main>
  );
}
