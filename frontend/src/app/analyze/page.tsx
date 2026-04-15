"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SpotlightCard from "@/components/SpotlightCard";

interface AnalysisResult {
  risk_score: number;
  flags: Array<{
    clause_title: string;
    simple_explanation: string;
    severity: string;
  }>;
}

export default function AnalyzePage() {
  const searchParams = useSearchParams();
  const namespace = searchParams.get("ns");
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalysis() {
      if (!namespace) return;
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/analyze/${namespace}`,
        );
        const result = await response.json();
        setData(result.analysis);
      } catch (err) {
        console.error("Analysis failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalysis();
  }, [namespace]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#5E6AD2] w-1/3 animate-loading-bar shadow-[0_0_12px_rgba(94,106,210,0.8)]" />
        </div>
        <p className="font-mono text-xs tracking-widest text-[#8A8F98]">
          AI DECODING LEGALESE...
        </p>
      </div>
    );
  }

  return (
    <main className="max-w-[1400px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <section className="lg:col-span-12 flex flex-col gap-4 animate-reveal">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h2 className="text-sm font-mono tracking-widest text-[#8A8F98]">
            ANALYSIS_RESULTS: {namespace}
          </h2>
          <div className="px-3 py-1 rounded bg-[#5E6AD2]/20 text-[#5E6AD2] border border-[#5E6AD2]/30 text-xs">
            RISK SCORE: {data?.risk_score}/10
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.flags.map((flag, idx) => (
            <SpotlightCard key={idx} className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 w-2 h-2 rounded-full ${flag.severity === "High" ? "bg-red-500 shadow-[0_0_8px_red]" : "bg-yellow-500"}`}
                />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-[#EDEDEF]">
                    {flag.clause_title}
                  </h3>
                  <p className="text-[#8A8F98] leading-relaxed">
                    {flag.simple_explanation}
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
