export interface ParseResult {
  success: true;
  text: string;
  pageCount: number;
}

export interface ParseError {
  success: false;
  error: string;
  nextStep: string;
}

export type PDFParseResult = ParseResult | ParseError;

export async function parsePDF(buffer: Buffer): Promise<PDFParseResult> {
  try {
    // Dynamic import to avoid build-time execution issues
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);

    if (!data.text || data.text.trim().length === 0) {
      return {
        success: false,
        error: "No readable text found in this PDF.",
        nextStep: "This PDF may contain only images. Try a text-based PDF.",
      };
    }

    return {
      success: true,
      text: data.text.trim(),
      pageCount: data.numpages,
    };
  } catch (err) {
    // Log the actual error for debugging
    console.error("PDF parse error:", err);

    const message = err instanceof Error ? err.message : String(err);

    if (message.toLowerCase().includes("password")) {
      return {
        success: false,
        error: "This PDF is password protected.",
        nextStep: "Remove the password and try again.",
      };
    }

    // Check for test file error (pdf-parse quirk)
    if (message.includes("ENOENT") && message.includes("test")) {
      return {
        success: false,
        error: "PDF parser initialization error.",
        nextStep: "Server configuration issue. Please contact support.",
      };
    }

    return {
      success: false,
      error: "Unable to read this PDF file.",
      nextStep:
        "The file may be damaged. Try re-downloading or exporting it again.",
    };
  }
}
