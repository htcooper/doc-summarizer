"use client";

import { useState, useRef } from "react";
import { PDFUploader } from "@/components/pdf-uploader";
import { SummaryCard } from "@/components/summary-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setSummaryData(null);
    setFileName(null);

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
      setFileName(file.name);

      // Generate summary (cancellable)
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const summarizeResponse = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: uploadData.text }),
        signal: abortController.signal,
      });

      const summarizeData = await summarizeResponse.json();

      if (!summarizeResponse.ok) {
        const errorData = summarizeData as UploadError;
        setError(`${errorData.error} ${errorData.nextStep}`);
        setIsSummarizing(false);
        setFileName(null);
        return;
      }

      setSummaryData({
        shortSummary: summarizeData.shortSummary,
        expandedSummary: summarizeData.expandedSummary,
        fileName: file.name,
      });
      setIsSummarizing(false);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User cancelled — reset silently
        return;
      }
      console.error("Error:", err);
      setError(
        "Connection failed. Check your internet connection and try again."
      );
      setIsUploading(false);
      setIsSummarizing(false);
      setFileName(null);
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setIsSummarizing(false);
    setFileName(null);
    setError("Summary cancelled. Upload a new PDF.");
  };

  const handleFeedback = (isPositive: boolean, comment?: string) => {
    // In POC, just log feedback - production would store in Supabase
    console.log("Feedback:", { isPositive, comment });
  };

  const handleReset = () => {
    setSummaryData(null);
    setFileName(null);
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

          {isSummarizing && fileName && (
            <Card>
              <CardHeader className="pb-2 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 13h1c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1h-.5v1.5H8V13h.5zm3 0h1.25c.41 0 .75.34.75.75v2.5c0 .41-.34.75-.75.75H11.5V13zm3.5 0h2v1h-1v.5h1v1h-1V17h-1v-4z" />
                    </svg>
                    <span className="truncate max-w-[200px]">{fileName}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span className="sr-only">Cancel</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3 text-sm text-muted-foreground py-4">
                  <svg
                    className="animate-spin h-4 w-4"
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
              </CardContent>
            </Card>
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
