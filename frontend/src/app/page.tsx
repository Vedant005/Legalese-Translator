"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  ArrowRight,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

export default function LegaleseTranslator() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setIsAnalyzing(false); // Reset analysis state if a new file is dropped
    }
  };

  const handleAnalyze = () => {
    // In a real app, you would trigger the backend upload/analysis here
    setIsAnalyzing(true);

    // Optional: smoothly scroll to the results
    setTimeout(() => {
      document
        .getElementById("analysis-results")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <main className="max-w-7xl mx-auto px-8 md:px-8 lg:px-18 py-8 md:py-5">
      <header className="mb-10">
        <div className="flex items-center justify-between border-b border-black pb-4">
          <h1 className="font-display font-bold text-xl uppercase tracking-widest">
            Leagalese{" "}
            <span className="font-mono text-muted-foreground text-sm normal-case">
              v1.0
            </span>
          </h1>
          <span className="font-mono text-xs uppercase tracking-widest border border-black px-2 py-1">
            System Active
          </span>
        </div>
      </header>

      <section className="mb-5 relative">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-black" />
        <h2 className="font-display text-5xl md:text-7xl lg:text-9xl tracking-tighter leading-none mb-8 pt-2">
          DECODE THE
          <span className="italic"> FINE PRINT.</span>
        </h2>
        <p className="font-body text-xl lg:text-2xl max-w-2xl leading-relaxed">
          Upload any terms of service, privacy policy, or contract. Our AI
          isolates the risk, exposing obligations hidden in legalese.
        </p>
      </section>

      <hr className="border-t-[4px] border-black my-16" />

      <section className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <h3 className="font-display text-3xl mb-4">Input Document</h3>
          <p className="font-body text-muted-foreground mb-6">
            Supported formats: PDF, DOCX, TXT. Maximum file size: 10MB. Text is
            processed securely and is not retained post-analysis.
          </p>
          <div className="texture-lines w-full h-24 opacity-[0.015]"></div>
        </div>

        <div className="md:col-span-8">
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative flex flex-col items-center justify-center w-full min-h-[320px] 
              border-2 border-black cursor-pointer transition-colors duration-100 group
              focus-within:outline focus-within:outline-3 focus-within:outline-black focus-within:outline-offset-3
              ${isDragging ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"}
            `}
          >
            <input
              type="file"
              className="sr-only"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                  setIsAnalyzing(false);
                }
              }}
            />

            {!file ? (
              <div className="text-center p-8 flex flex-col items-center">
                <Upload
                  size={32}
                  strokeWidth={1}
                  className={`mb-6 transition-colors duration-100 ${isDragging ? "text-white" : "text-black group-hover:text-white"}`}
                />
                <span className="font-display text-2xl mb-2">
                  Click to browse or drag file here
                </span>
                <span className="font-mono text-xs tracking-widest uppercase">
                  Awaiting Input...
                </span>
              </div>
            ) : (
              <div className="text-center p-8 flex flex-col items-center">
                <FileText
                  size={48}
                  strokeWidth={1}
                  className={`mb-6 transition-colors duration-100 ${isDragging ? "text-white" : "text-black group-hover:text-white"}`}
                />
                <span className="font-display text-2xl mb-2">{file.name}</span>
                <span className="font-mono text-xs tracking-widest uppercase mt-4 border-t border-current pt-4">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for Analysis
                </span>
              </div>
            )}
          </label>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={!file}
              className={`
                flex items-center gap-4 px-8 py-4 uppercase tracking-widest text-sm font-medium
                transition-none border-2 border-transparent
                focus-visible:outline focus-visible:outline-3 focus-visible:outline-black focus-visible:outline-offset-3
                ${
                  file
                    ? "bg-black text-white hover:bg-white hover:text-black hover:border-black cursor-pointer"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }
              `}
            >
              Analyze Document
              <ArrowRight size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </section>

      {isAnalyzing && (
        <section
          id="analysis-results"
          className="animate-in fade-in duration-500 mt-16"
        >
          <hr className="border-t-[8px] border-black my-24" />

          <header className="mb-16 border-b-2 border-black pb-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-8">
              <span className="font-mono text-xs uppercase tracking-widest border border-black px-2 py-1 mb-6 inline-block bg-black text-white">
                Final Report Generated
              </span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight leading-none">
                Risk Assessment Profile
              </h2>
              <div className="font-mono text-sm mt-4 text-muted-foreground flex gap-4 uppercase tracking-widest">
                <span>
                  Namespace: {file?.name || "xyz_terms_and_conditions.pdf"}
                </span>
                <span>•</span>
                <span>Flags: 7 Detected</span>
              </div>
            </div>

            {/* BIG METRIC HERO */}
            <div className="md:col-span-4 text-right">
              <span className="font-mono text-sm uppercase tracking-widest block mb-2">
                Total Risk Score
              </span>
              <div className="font-display text-8xl lg:text-9xl tracking-tighter leading-none text-black">
                9
                <span className="text-4xl lg:text-5xl text-muted-foreground">
                  /10
                </span>
              </div>
            </div>
          </header>

          {/* TL;DR SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24">
            <div className="md:col-span-4 border-r-2 border-black pr-8">
              <h3 className="font-display text-3xl mb-4">Executive Summary</h3>
              <div className="texture-lines w-full h-12 opacity-[0.015]"></div>
            </div>
            <div className="md:col-span-8">
              <p className="font-body text-2xl lg:text-3xl leading-relaxed">
                This document heavily favors the drafting party. It severely
                limits your ability to claim damages, imposes strict financial
                penalties for standard cancellations, and shifts the burden of
                intellectual property disputes entirely onto you. Proceed with
                extreme caution.
              </p>
            </div>
          </div>

          {/* DETAILED FLAGS */}
          <div className="space-y-12">
            {/* HIGH RISK FLAG 1 */}
            <article className="border-4 border-black bg-black text-white p-8 md:p-12 relative group">
              <div className="absolute top-0 right-0 bg-white text-black p-4 border-b-4 border-l-4 border-black">
                <ShieldAlert size={32} strokeWidth={1.5} />
              </div>
              <span className="font-mono text-xs uppercase tracking-widest mb-6 block border-b border-white/20 pb-4 inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-white inline-block"></span>
                Severity: High Risk
              </span>

              <h4 className="font-display text-3xl md:text-5xl mb-8">
                Refund with Depreciation
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
                <div>
                  <h5 className="font-mono text-xs uppercase tracking-widest text-white/60 mb-3">
                    Simple Explanation
                  </h5>
                  <p className="font-body text-xl lg:text-2xl leading-relaxed">
                    If the seller has to take back the goods because of a
                    problem, they will only give you back the money you paid,
                    minus 20% for each year you had the goods. This means you
                    might not get all your money back.
                  </p>
                </div>
                <div className="border-t border-white/20 md:border-t-0 md:border-l border-white/20 pt-8 md:pt-0 md:pl-8">
                  <h5 className="font-mono text-xs uppercase tracking-widest text-white/60 mb-3">
                    Extracted Legalese
                  </h5>
                  <p className="font-mono text-sm leading-relaxed text-white/80 bg-white/5 p-4 border border-white/10">
                    "In the event of a required refund or return of defective
                    merchandise, Seller shall remit the purchase price less a
                    twenty percent (20%) depreciation fee per annum from the
                    date of original delivery..."
                  </p>

                  <h5 className="font-mono text-xs uppercase tracking-widest text-white/60 mt-6 mb-3">
                    Actionable Advice
                  </h5>
                  <p className="font-body text-lg text-white">
                    Do not sign if you expect long-term warranty protection.
                    Negotiate a full refund for manufacturer defects.
                  </p>
                </div>
              </div>
            </article>

            {/* HIGH RISK FLAG 2 */}
            <article className="border-4 border-black bg-black text-white p-8 md:p-12 relative">
              <div className="absolute top-0 right-0 bg-white text-black p-4 border-b-4 border-l-4 border-black">
                <ShieldAlert size={32} strokeWidth={1.5} />
              </div>
              <span className="font-mono text-xs uppercase tracking-widest mb-6 block border-b border-white/20 pb-4 inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-white inline-block"></span>
                Severity: High Risk
              </span>

              <h4 className="font-display text-3xl md:text-5xl mb-8">
                Limited Warranty
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
                <div>
                  <h5 className="font-mono text-xs uppercase tracking-widest text-white/60 mb-3">
                    Simple Explanation
                  </h5>
                  <p className="font-body text-xl lg:text-2xl leading-relaxed">
                    The seller is only responsible for replacing goods that are
                    defective, and they won't pay more than the original price
                    of the goods. This means if something goes wrong, you might
                    not get much help or money back.
                  </p>
                </div>
                <div className="border-t border-white/20 md:border-t-0 md:border-l border-white/20 pt-8 md:pt-0 md:pl-8">
                  <h5 className="font-mono text-xs uppercase tracking-widest text-white/60 mb-3">
                    Extracted Legalese
                  </h5>
                  <p className="font-mono text-sm leading-relaxed text-white/80 bg-white/5 p-4 border border-white/10">
                    "Liability of Seller is limited strictly to replacement of
                    defective goods and shall in no event exceed the original
                    purchase price paid by Buyer..."
                  </p>

                  <h5 className="font-mono text-xs uppercase tracking-widest text-white/60 mt-6 mb-3">
                    Actionable Advice
                  </h5>
                  <p className="font-body text-lg text-white">
                    Be aware that secondary damages (like lost data or business
                    interruption) are entirely uncovered.
                  </p>
                </div>
              </div>
            </article>

            {/* MEDIUM RISK FLAG 1 */}
            <article className="border-2 border-black bg-white text-black p-8 md:p-12">
              <span className="font-mono text-xs uppercase tracking-widest mb-6 block border-b border-black pb-4 text-muted-foreground inline-flex items-center gap-2">
                <AlertTriangle
                  size={14}
                  strokeWidth={2}
                  className="text-black"
                />
                Severity: Moderate
              </span>

              <h4 className="font-display text-3xl md:text-4xl mb-6">
                No Other Warranties
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-6">
                <div>
                  <h5 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
                    Simple Explanation
                  </h5>
                  <p className="font-body text-xl leading-relaxed">
                    The seller is saying that the only promises they make are
                    the ones written down in the contract. If something goes
                    wrong and it's not in the contract, they might not help you.
                  </p>
                </div>
                <div className="border-t border-black/10 md:border-t-0 md:border-l border-black/10 pt-8 md:pt-0 md:pl-8">
                  <h5 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
                    Extracted Legalese
                  </h5>
                  <p className="font-mono text-sm leading-relaxed text-muted-foreground bg-muted/30 p-4 border border-black/10">
                    "Except as expressly set forth herein, Seller makes no
                    warranties, express or implied, including but not limited to
                    implied warranties of merchantability..."
                  </p>

                  <h5 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-6 mb-3">
                    Actionable Advice
                  </h5>
                  <p className="font-body text-lg font-medium">
                    Ensure every verbal promise the salesperson made is
                    explicitly written into this document before signing.
                  </p>
                </div>
              </div>
            </article>

            {/* MEDIUM RISK FLAG 2 */}
            <article className="border-2 border-black bg-white text-black p-8 md:p-12">
              <span className="font-mono text-xs uppercase tracking-widest mb-6 block border-b border-black pb-4 text-muted-foreground inline-flex items-center gap-2">
                <AlertTriangle
                  size={14}
                  strokeWidth={2}
                  className="text-black"
                />
                Severity: Moderate
              </span>

              <h4 className="font-display text-3xl md:text-4xl mb-6">
                Cancellation Fee
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-6">
                <div>
                  <h5 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
                    Simple Explanation
                  </h5>
                  <p className="font-body text-xl leading-relaxed">
                    If you cancel your order or want to change it, you have to
                    pay 15% of the remaining price, plus any costs the seller
                    already had. This could be a lot of money.
                  </p>
                </div>
                <div className="border-t border-black/10 md:border-t-0 md:border-l border-black/10 pt-8 md:pt-0 md:pl-8">
                  <h5 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
                    Extracted Legalese
                  </h5>
                  <p className="font-mono text-sm leading-relaxed text-muted-foreground bg-muted/30 p-4 border border-black/10">
                    "Any cancellation or modification of orders by Buyer is
                    subject to a cancellation fee equal to fifteen percent (15%)
                    of the remaining balance..."
                  </p>

                  <h5 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-6 mb-3">
                    Actionable Advice
                  </h5>
                  <p className="font-body text-lg font-medium">
                    Do not sign if your business requirements might change.
                    Attempt to negotiate a penalty-free cancellation window of
                    30 days.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}
    </main>
  );
}
