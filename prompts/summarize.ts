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
