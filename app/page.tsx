"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf-uploader";
import { SummaryCard } from "@/components/summary-card";

interface SummaryData {
  shortSummary: string;
  expandedSummary: string[];
  fileName: string;
}

interface UploadError {
  error: string;
  nextStep: string;
}

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setSummaryData(null);

    try {
      // Upload and extract text
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        const errorData = uploadData as UploadError;
        setError(`${errorData.error} ${errorData.nextStep}`);
        setIsUploading(false);
        return;
      }

      setIsUploading(false);
      setIsSummarizing(true);

      // Generate summary
      const summarizeResponse = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: uploadData.text }),
      });

      const summarizeData = await summarizeResponse.json();

      if (!summarizeResponse.ok) {
        const errorData = summarizeData as UploadError;
        setError(`${errorData.error} ${errorData.nextStep}`);
        setIsSummarizing(false);
        return;
      }

      setSummaryData({
        shortSummary: summarizeData.shortSummary,
        expandedSummary: summarizeData.expandedSummary,
        fileName: file.name,
      });
      setIsSummarizing(false);
    } catch (err) {
      console.error("Error:", err);
      setError(
        "Connection failed. Check your internet connection and try again."
      );
      setIsUploading(false);
      setIsSummarizing(false);
    }
  };

  const handleFeedback = (isPositive: boolean, comment?: string) => {
    // In POC, just log feedback - production would store in Supabase
    console.log("Feedback:", { isPositive, comment });
  };

  const handleReset = () => {
    setSummaryData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <header className="text-center mb-8">
          <h1 className="text-xl font-bold tracking-tight">File Upload Summarizer</h1>
        </header>

        <main className="space-y-6">
          {!summaryData && !isSummarizing && (
            <PDFUploader
              onUpload={handleUpload}
              isUploading={isUploading}
              error={error}
            />
          )}

          {isSummarizing && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 text-sm text-muted-foreground">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Generating summary...</span>
              </div>
            </div>
          )}

          {summaryData && (
            <SummaryCard
              shortSummary={summaryData.shortSummary}
              expandedSummary={summaryData.expandedSummary}
              fileName={summaryData.fileName}
              onRemove={handleReset}
              onFeedback={handleFeedback}
            />
          )}
        </main>
      </div>
    </div>
  );
}
