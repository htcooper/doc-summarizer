import { NextRequest, NextResponse } from "next/server";
import { parsePDF } from "@/lib/pdf-parser";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          error: "No file selected.",
          nextStep: "Drag and drop a PDF or click to browse.",
        },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        {
          error: "Only PDF files are accepted.",
          nextStep: "Please select a .pdf file.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "File exceeds 50MB limit.",
          nextStep: "Try a smaller file or compress your PDF.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await parsePDF(buffer);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          nextStep: result.nextStep,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      text: result.text,
      pageCount: result.pageCount,
      fileName: file.name,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      {
        error: "Something went wrong.",
        nextStep: "Please try again. If the problem persists, try a different file.",
      },
      { status: 500 }
    );
  }
}
