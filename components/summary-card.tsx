"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface SummaryCardProps {
  shortSummary: string;
  expandedSummary: string[];
  fileName: string;
  onRemove: () => void;
  onFeedback: (isPositive: boolean, comment?: string) => void;
}

export function SummaryCard({
  shortSummary,
  expandedSummary,
  fileName,
  onRemove,
  onFeedback,
}: SummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<"positive" | "negative" | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleThumbsUp = () => {
    if (feedbackGiven === "positive") return;
    setFeedbackGiven("positive");
    setShowComment(false);
    setComment("");
    onFeedback(true);
  };

  const handleThumbsDown = () => {
    if (feedbackGiven === "negative") return;
    setFeedbackGiven("negative");
    setShowComment(true);
  };

  const handleSubmitComment = () => {
    setFeedbackSubmitted(true);
    setShowComment(false);
    onFeedback(false, comment || undefined);
  };

  return (
    <Card>
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {/* PDF Icon */}
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
            onClick={onRemove}
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
            <span className="sr-only">Remove PDF</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="text-sm">
          <span className="text-muted-foreground">Summary: </span>
          {shortSummary}
        </p>

        {isExpanded && expandedSummary.length > 0 && (
          <ul className="space-y-1.5 text-sm text-muted-foreground ml-1">
            {expandedSummary.map((point, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="link"
            className="p-0 h-auto text-sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "See Less" : "See More"}
          </Button>

          {/* Feedback section */}
          <div className="flex items-center gap-2">
            {feedbackSubmitted ? (
              <span className="text-sm text-muted-foreground">Thanks!</span>
            ) : (
              <>
                <span className="text-sm text-muted-foreground">Helpful?</span>
                <Button
                  variant={feedbackGiven === "positive" ? "default" : "outline"}
                  size="sm"
                  onClick={handleThumbsUp}
                  className="h-7 w-7 p-0"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="sr-only">Yes</span>
                </Button>
                <Button
                  variant={feedbackGiven === "negative" ? "default" : "outline"}
                  size="sm"
                  onClick={handleThumbsDown}
                  className="h-7 w-7 p-0"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                    />
                  </svg>
                  <span className="sr-only">No</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {showComment && (
          <div className="space-y-2 pt-2 border-t">
            <Textarea
              placeholder="What could be improved? (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="text-sm"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleSubmitComment}>
                Submit
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
