"use client";

import { useState, useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Upload,
  FileText,
  ArrowRight,
  AlertTriangle,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useAnalysisStore } from "./store/AnalysisStore";

export default function LegaleseTranslator() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { analysisResult, fileName, setAnalysisResult } = useAnalysisStore();

  // Hydration fix for Next.js SSR
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      setAnalysisResult(null, null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setAnalysisResult(null, null);

    try {
      // 1. Upload the file
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload the document.");
      }

      const uploadData = await uploadRes.json();
      const namespace = uploadData.namespace;

      // 2. Fetch the analysis using the generated namespace
      const analyzeRes = await fetch(
        `http://localhost:8000/analyze/${namespace}`,
      );

      if (!analyzeRes.ok) {
        throw new Error("Failed to analyze the document.");
      }

      const analyzeData = await analyzeRes.json();

      // Save result and file name to persistent storage
      setAnalysisResult(analyzeData, file.name);

      // Smoothly scroll to the results
      setTimeout(() => {
        document
          .getElementById("analysis-results")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Prevent rendering persistent state until client has mounted to avoid hydration errors
  if (!isMounted) return null;

  return (
    <main className="max-w-7xl mx-auto px-8 md:px-8 lg:px-18 py-8 md:py-5">
      <header className="mb-10">
        <div className="flex items-center justify-between border-b border-black pb-4">
          <h1 className="font-display font-bold text-xl uppercase tracking-widest">
            Legalese{" "}
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
                  setAnalysisResult(null, null); // Clear persistent state on new file
                  setError(null);
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

          {error && (
            <div className="mt-8 border-2 border-black bg-white p-4 flex items-center gap-4">
              <AlertTriangle className="text-black" size={24} />
              <span className="font-mono text-sm uppercase tracking-widest text-black font-bold">
                Error: {error}
              </span>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={!file || isProcessing}
              className={`
                flex items-center gap-4 px-8 py-4 uppercase tracking-widest text-sm font-medium
                transition-none border-2 border-transparent
                focus-visible:outline focus-visible:outline-3 focus-visible:outline-black focus-visible:outline-offset-3
                ${
                  file && !isProcessing
                    ? "bg-black text-white hover:bg-white hover:text-black hover:border-black cursor-pointer"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }
              `}
            >
              {isProcessing ? (
                <>
                  Processing
                  <Loader2
                    size={20}
                    strokeWidth={1.5}
                    className="animate-spin"
                  />
                </>
              ) : (
                <>
                  Analyze Document
                  <ArrowRight size={20} strokeWidth={1.5} />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {analysisResult && (
        <section
          id="analysis-results"
          className="animate-in fade-in duration-500 mt-6"
        >
          <hr className="border-t-[8px] border-black my-15" />

          <header className="mb-16 border-b-2 border-black pb-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-8">
              <span className="font-mono text-xs uppercase tracking-widest border border-black px-2 py-1 mb-6 inline-block bg-black text-white">
                Final Report Generated
              </span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight leading-none">
                Risk Assessment Profile
              </h2>
              <div className="font-mono text-sm mt-4 text-muted-foreground flex flex-wrap gap-4 uppercase tracking-widest">
                {/* <span className="truncate max-w-[200px] md:max-w-md">
                  ID: {analysisResult.filename}
                </span> */}
                {/* <span>•</span> */}
                <span>
                  Flags: {analysisResult.analysis.flags.length} Detected
                </span>
              </div>
            </div>

            <div className="md:col-span-4 text-right">
              <span className="font-mono text-sm uppercase tracking-widest block mb-2">
                Total Risk Score
              </span>
              <div className="font-display text-8xl lg:text-9xl tracking-tighter leading-none text-black">
                {analysisResult.analysis.risk_score}
                <span className="text-4xl lg:text-5xl text-muted-foreground">
                  /10
                </span>
              </div>
            </div>
          </header>

          <div className="space-y-12">
            {analysisResult.analysis.flags.map((flag: any, index: number) => {
              const isHighRisk = flag.severity.toLowerCase().includes("high");

              if (isHighRisk) {
                return (
                  <article
                    key={index}
                    className="border-4 border-black bg-black text-white p-8 md:p-12 relative group"
                  >
                    <div className="absolute top-0 right-0 bg-white text-black p-4 border-b-4 border-l-4 border-black">
                      <ShieldAlert size={32} strokeWidth={1.5} />
                    </div>
                    <span className="font-mono text-xs uppercase tracking-widest mb-6 block border-b border-white/20 pb-4 inline-flex items-center gap-2">
                      <span className="w-2 h-2 bg-white inline-block"></span>
                      Severity: High Risk
                    </span>

                    <h4 className="font-display text-3xl md:text-5xl mb-8">
                      {flag.clause_title}
                    </h4>

                    <div>
                      <h5 className="font-mono text-xs uppercase tracking-widest text-white/60 mb-3">
                        Simple Explanation
                      </h5>
                      <p className="font-body text-xl lg:text-2xl leading-relaxed max-w-4xl">
                        {flag.simple_explanation}
                      </p>
                    </div>
                  </article>
                );
              }

              return (
                <article
                  key={index}
                  className="border-2 border-black bg-white text-black p-8 md:p-12"
                >
                  <span className="font-mono text-xs uppercase tracking-widest mb-6 block border-b border-black pb-4 text-muted-foreground inline-flex items-center gap-2">
                    <AlertTriangle
                      size={14}
                      strokeWidth={2}
                      className="text-black"
                    />
                    Severity: {flag.severity}
                  </span>

                  <h4 className="font-display text-3xl md:text-4xl mb-6">
                    {flag.clause_title}
                  </h4>

                  <div>
                    <h5 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
                      Simple Explanation
                    </h5>
                    <p className="font-body text-xl leading-relaxed max-w-4xl">
                      {flag.simple_explanation}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
