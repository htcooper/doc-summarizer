"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackWidgetProps {
  onFeedback: (isPositive: boolean, comment?: string) => void;
}

export function FeedbackWidget({ onFeedback }: FeedbackWidgetProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<"positive" | "negative" | null>(
    null
  );
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

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
    setSubmitted(true);
    onFeedback(false, comment || undefined);
  };

  if (submitted) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="py-3 text-center">
          <p className="text-sm text-muted-foreground">
            Thanks for your feedback!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/50">
      <CardContent className="py-3 space-y-3">
        <div className="flex items-center justify-center gap-3">
          <p className="text-sm text-muted-foreground">Was this summary helpful?</p>
          <div className="flex gap-2">
            <Button
              variant={feedbackGiven === "positive" ? "default" : "outline"}
              size="sm"
              onClick={handleThumbsUp}
              className="gap-1"
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
              Yes
            </Button>
            <Button
              variant={feedbackGiven === "negative" ? "default" : "outline"}
              size="sm"
              onClick={handleThumbsDown}
              className="gap-1"
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
              No
            </Button>
          </div>
        </div>

        {showComment && (
          <div className="space-y-2">
            <Textarea
              placeholder="What could be improved? (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="text-sm"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleSubmitComment}>
                Submit Feedback
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
