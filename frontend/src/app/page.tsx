"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SpotlightCard from "@/components/SpotlightCard";
import { getUserId } from "@/lib/session";

export default function Home() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file || file.type !== "application/pdf") return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const userId = getUserId();
      const response = await fetch(
        `http://127.0.0.1:8000/upload?user_id=${userId}`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();
      if (response.ok) {
        // Redirect to analysis page with the specific namespace returned by backend
        router.push(`/analyze?ns=${data.namespace}`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
    }
  };

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-24 md:py-32 flex flex-col items-center justify-center text-center">
      {/* ... Hero Section ... */}

      <div className="w-full max-w-2xl mt-16">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf"
          onChange={(e) =>
            e.target.files?.[0] && handleUpload(e.target.files[0])
          }
        />

        <SpotlightCard
          className={`p-1 ${isDragging ? "border-[#5E6AD2]/50" : ""}`}
        >
          <div
            className={`flex flex-col items-center justify-center py-24 px-8 border border-dashed border-white/10 rounded-xl bg-[#050506]/50 backdrop-blur-sm cursor-pointer transition-opacity ${isUploading ? "opacity-50 pointer-events-none" : "group"}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              handleUpload(file);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="animate-pulse text-[#5E6AD2]">
                UPLOADING TO SECURE ENGINE...
              </div>
            ) : (
              <>
                <div className="w-12 h-12 mb-6 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:scale-[0.98] transition-transform">
                  <svg
                    className="w-6 h-6 text-[#8A8F98] group-hover:text-[#EDEDEF]"
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
                  Drop your contract here
                </h3>
                <p className="text-sm text-[#8A8F98]">PDF documents only</p>
                <div className="mt-8 px-6 py-2 rounded-lg bg-[#5E6AD2] text-white text-sm font-medium">
                  Select File
                </div>
              </>
            )}
          </div>
        </SpotlightCard>
      </div>
    </main>
  );
}
