import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AnalysisState {
  analysisResult: any | null;
  fileName: string | null;
  setAnalysisResult: (result: any | null, name: string | null) => void;
  clearAnalysis: () => void;
}

const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      analysisResult: null,
      fileName: null,
      setAnalysisResult: (result, name) =>
        set({ analysisResult: result, fileName: name }),
      clearAnalysis: () => set({ analysisResult: null, fileName: null }),
    }),
    {
      name: "aequitas-analysis-storage",
    },
  ),
);

export { useAnalysisStore };
