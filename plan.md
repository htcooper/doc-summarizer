# PDF Summarizer POC - Build Plan

## Overview
A proof-of-concept app that allows users to upload PDF files, extract text, and generate AI-powered summaries using OpenAI GPT-4o-mini.

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 14 (App Router) | Required; production-ready for Vercel deployment |
| UI Components | shadcn/ui | Required; Tailwind-based, accessible components |
| PDF Parsing | pdf-parse | Lightweight, text extraction from PDFs |
| AI Summarization | OpenAI API (gpt-4o-mini) | Required; cost-effective for summaries |
| State Management | React useState | Sufficient for POC scope |
| Styling | Tailwind CSS | Bundled with shadcn/ui |

## Architecture Decisions

### Storage: In-Memory Only
- PDFs processed in memory, not persisted
- Feedback stored in component state (not persisted)
- Production will use Supabase for storage/persistence

### File Handling
- Max file size: 50MB (POC)
- Text-based PDFs only (no OCR)
- Client-side file validation before upload

### API Routes
- `/api/upload` - Receives PDF, extracts text, returns extracted content
- `/api/summarize` - Takes extracted text, returns short + expanded summaries

### No Authentication
- Skipped for POC
- Production will integrate Supabase Auth

### Single PDF Workflow
- One PDF processed at a time
- User uploads → views summary → gives feedback → can upload another
- No batch processing for POC

## Project Structure

```
memorang-uploader-final/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Main upload page
│   ├── globals.css
│   └── api/
│       ├── upload/route.ts   # PDF upload & text extraction
│       └── summarize/route.ts # OpenAI summarization
├── components/
│   ├── ui/                   # shadcn components
│   ├── pdf-uploader.tsx      # Drag-and-drop upload zone
│   ├── summary-card.tsx      # Short summary + "See More"
│   ├── expanded-summary.tsx  # Bullet points view
│   └── feedback-widget.tsx   # Thumbs up/down + comments
├── lib/
│   ├── utils.ts              # shadcn utility
│   ├── pdf-parser.ts         # PDF text extraction logic
│   └── openai.ts             # OpenAI client configuration
├── prompts/
│   └── summarize.ts          # All prompts in one editable file
├── .env.local                # OPENAI_API_KEY
├── package.json
└── README.md
```

## Implementation Steps

### Phase 1: Project Setup
1. Initialize Next.js 14 project with TypeScript
2. Install and configure shadcn/ui
3. Set up Tailwind CSS
4. Create folder structure

### Phase 2: PDF Upload Component
1. Create drag-and-drop zone using shadcn Card
2. Add click-to-upload fallback with hidden file input
3. Implement client-side validation (PDF type, 50MB max)
4. Show upload progress/status

### Phase 3: PDF Processing API
1. Create `/api/upload` route
2. Integrate pdf-parse for text extraction
3. Add error detection:
   - Corrupt/unreadable PDF → "Unable to read this PDF file"
   - No extractable text → "No readable text found"
   - Password protected → "This PDF is password protected"
4. Return extracted text or descriptive error with next steps

### Phase 4: AI Summarization
1. Set up OpenAI client with 30s timeout
2. Create `/api/summarize` route
3. Import prompts from `prompts/summarize.ts`
4. Add error handling:
   - Rate limit → "Service is busy. Please wait and try again."
   - Timeout → "Request timed out. Try again."
   - API key invalid → "Configuration error." (log details)
5. Implement 1 retry on transient failures

### Phase 5: Summary Display
1. Create summary card with 8-word summary
2. Add "See More" link with expand/collapse
3. Display bullet points in expanded view
4. Add loading states

### Phase 6: Feedback Widget
1. Create thumbs up/down buttons
2. Show comment input on thumbs-down
3. Store feedback in component state
4. Display confirmation after submission

### Phase 7: Polish & Testing
1. Add error handling throughout
2. Responsive design check
3. Manual testing with various PDFs
4. Create README with setup instructions

## Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "openai": "^4.x",
    "pdf-parse": "^1.x",
    "lucide-react": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  }
}
```

## Environment Variables

```
OPENAI_API_KEY=sk-...
```

## Error Handling Strategy

All errors display user-friendly messages with clear next steps.

### Client-Side Validation Errors

| Error | Message | Next Step |
|-------|---------|-----------|
| Wrong file type | "Only PDF files are accepted." | "Please select a .pdf file." |
| File too large | "File exceeds 50MB limit." | "Try a smaller file or compress your PDF." |
| No file selected | "No file selected." | "Drag and drop a PDF or click to browse." |

### Server-Side Errors

| Error | Message | Next Step |
|-------|---------|-----------|
| Corrupt PDF | "Unable to read this PDF file." | "The file may be damaged. Try re-downloading or exporting it again." |
| No text found | "No readable text found in this PDF." | "This PDF may contain only images. Try a text-based PDF." |
| PDF password protected | "This PDF is password protected." | "Remove the password and try again." |
| OpenAI API rate limit | "Service is busy." | "Please wait a moment and try again." |
| OpenAI API key invalid | "Configuration error." | "Contact support." (logged for dev) |
| OpenAI API timeout | "Request timed out." | "Try again. If the PDF is large, it may take longer." |
| Network error | "Connection failed." | "Check your internet connection and try again." |
| Unknown error | "Something went wrong." | "Please try again. If the problem persists, try a different file." |

### Implementation Details
- Client validates file type and size before upload
- Server wraps pdf-parse in try/catch to detect corrupt files
- OpenAI calls use timeout (30s) and retry logic (1 retry)
- All errors logged to console with full details for debugging
- User-facing errors never expose technical details

## Prompts File (`prompts/summarize.ts`)

Prompts stored in a dedicated file for easy editing:

```typescript
export const PROMPTS = {
shortSummary: `Summarize this document in 8 words or fewer.
Rules:
- Use direct, 3rd person, active voice
- No filler words (the, a, an, very, really)
- Use direct phrasing: "Discussion of...", "Analysis of...", "Overview of..."
- Be specific, not vague

Return ONLY the summary, nothing else.`,

expandedSummary: `List the 3 most important points from this document.
Rules:
- One sentence per bullet, max 15 words
- Start each bullet with an action or key fact
- Use 3rd person active voice
- No repetition between bullets
- Skip introductions and conclusions, focus on substance

Return ONLY the bullet points in this format:
• Point one
• Point two
• Point three`,
};

```

### Prompt Design Principles
- Clear, direct output (no "This document discusses...")
- Word limits enforced in prompt
- Active voice required
- Substance over fluff

## Verification Plan

### 1. Upload Testing
| Test | Expected Result |
|------|-----------------|
| Drag-and-drop a PDF | File appears in upload zone |
| Click to upload | File picker opens, accepts .pdf only |
| Upload non-PDF (.txt, .docx) | Error: "Only PDF files are accepted." |
| Upload >50MB file | Error: "File exceeds 50MB limit." |

### 2. Error Handling Testing
| Test | Expected Result |
|------|-----------------|
| Upload corrupt PDF | Error: "Unable to read this PDF file." + next steps |
| Upload image-only PDF | Error: "No readable text found." + next steps |
| Disconnect network, then upload | Error: "Connection failed." + next steps |
| Invalid API key in .env | Error: "Configuration error." (no key leak) |

### 3. Summary Testing
| Test | Expected Result |
|------|-----------------|
| Upload valid PDF | 8-word max summary displays (direct phrasing) |
| Click "See More" | Expands to show 3 bullet points |
| Click "See Less" | Collapses back to short summary |
| Summary content | No filler words, starts with action/noun |

### 4. Feedback Testing
| Test | Expected Result |
|------|-----------------|
| Click thumbs up | Confirmation message, buttons disabled |
| Click thumbs down | Comment input appears |
| Submit thumbs down with comment | Confirmation message |
| Submit thumbs down without comment | Still works (comment optional) |

## Production Considerations (Future)

- Chunked uploads for larger files (tus-js-client or similar)
- Supabase Storage for PDF persistence
- Supabase Database for feedback persistence
- Supabase Auth for user management
- Rate limiting on API routes
- OCR support for scanned PDFs (Tesseract.js or cloud OCR)
