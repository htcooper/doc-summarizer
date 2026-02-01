import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, OPENAI_CONFIG } from "@/lib/openai";
import { PROMPTS } from "@/prompts/summarize";

interface SummarizeRequest {
  text: string;
}

async function generateSummary(
  text: string,
  prompt: string,
  retryCount = 0
): Promise<string> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: text.slice(0, 15000) }, // Limit text to avoid token limits
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content?.trim() || "";
  } catch (err) {
    // Retry once on transient failures
    if (retryCount < OPENAI_CONFIG.maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return generateSummary(text, prompt, retryCount + 1);
    }
    throw err;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SummarizeRequest = await request.json();

    if (!body.text || body.text.trim().length === 0) {
      return NextResponse.json(
        {
          error: "No text provided.",
          nextStep: "Upload a PDF first.",
        },
        { status: 400 }
      );
    }

    const [shortSummary, expandedSummary] = await Promise.all([
      generateSummary(body.text, PROMPTS.shortSummary),
      generateSummary(body.text, PROMPTS.expandedSummary),
    ]);

    // Parse bullet points from expanded summary
    const bullets = expandedSummary
      .split("\n")
      .filter((line) => line.trim().startsWith("•") || line.trim().startsWith("-"))
      .map((line) => line.replace(/^[•\-]\s*/, "").trim())
      .slice(0, 3);

    return NextResponse.json({
      shortSummary,
      expandedSummary: bullets,
    });
  } catch (err) {
    console.error("Summarize error:", err);

    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("rate") || message.includes("429")) {
      return NextResponse.json(
        {
          error: "Service is busy.",
          nextStep: "Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    if (message.includes("timeout") || message.includes("ETIMEDOUT")) {
      return NextResponse.json(
        {
          error: "Request timed out.",
          nextStep: "Try again. If the PDF is large, it may take longer.",
        },
        { status: 408 }
      );
    }

    if (message.includes("invalid") || message.includes("401")) {
      console.error("API key error - check OPENAI_API_KEY configuration");
      return NextResponse.json(
        {
          error: "Configuration error.",
          nextStep: "Contact support.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Something went wrong.",
        nextStep: "Please try again. If the problem persists, try a different file.",
      },
      { status: 500 }
    );
  }
}
