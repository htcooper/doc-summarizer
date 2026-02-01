# PDF Summarizer POC

Upload PDF files and get AI-powered summaries using OpenAI GPT-4o-mini.

## Features

- Drag-and-drop or click-to-upload PDF files
- 8-word summary with expandable bullet points
- Thumbs up/down feedback with optional comments
- Client and server-side validation with descriptive error messages

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Tech Stack

- Next.js 14 (App Router)
- shadcn/ui + Tailwind CSS
- OpenAI GPT-4o-mini
- pdf-parse for text extraction

## Limitations (POC)

- 50MB max file size
- Text-based PDFs only (no OCR)
- In-memory processing (no persistence)
- No authentication

## Project Structure

```
app/
├── page.tsx              # Main upload page
├── api/
│   ├── upload/route.ts   # PDF upload & text extraction
│   └── summarize/route.ts # OpenAI summarization
components/
├── pdf-uploader.tsx      # Drag-and-drop upload
├── summary-card.tsx      # Summary display
├── feedback-widget.tsx   # Thumbs up/down
lib/
├── pdf-parser.ts         # PDF text extraction
├── openai.ts             # OpenAI client config
prompts/
└── summarize.ts          # Editable AI prompts
```

## Customizing Prompts

Edit `prompts/summarize.ts` to modify how summaries are generated.
