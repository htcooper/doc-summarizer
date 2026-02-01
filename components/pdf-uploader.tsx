"use client";

import { useCallback, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PDFUploaderProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  error: string | null;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function PDFUploader({ onUpload, isUploading, error }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return "Only PDF files are accepted. Please select a .pdf file.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File exceeds 50MB limit. Try a smaller file or compress your PDF.";
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        return;
      }
      setValidationError(null);
      onUpload(file);
    },
    [onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const displayError = validationError || error;

  return (
    <Card
      className={`p-8 border-2 border-dashed transition-colors cursor-pointer ${
        isDragging
          ? "border-primary bg-primary/5"
          : displayError
            ? "border-destructive"
            : "border-muted-foreground/25 hover:border-primary/50"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <svg
            className="w-6 h-6 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {isUploading ? (
          <div className="space-y-2">
            <p className="text-sm">Processing PDF...</p>
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse" style={{ width: "60%" }} />
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-sm">
                Drag and drop your PDF here, or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Maximum file size: 50MB
              </p>
            </div>
            <Button variant="secondary" size="sm" type="button">
              Select PDF
            </Button>
          </>
        )}

        {displayError && (
          <p className="text-sm text-destructive">{displayError}</p>
        )}
      </div>
    </Card>
  );
}
