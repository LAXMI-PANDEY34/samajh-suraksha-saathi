import { z } from "zod";

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_TEXT_LENGTH = 60000;
export const SUPPORTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;

const hindiText = z.string().trim().min(1).max(2400).regex(/[\u0900-\u097f]/, "Explanations must be in Hindi.");
export const verdictSchema = z.enum(["green", "yellow", "red"]);
export const riskyClauseSchema = z.object({
  clause_text: z.string().min(1).max(2400),
  explanation: hindiText,
});
export const analysisContentSchema = z.object({
  document_type: z.enum(["Rent agreement", "Loan letter", "Bank notice", "Insurance policy", "Hospital bill", "Other document"]),
  verdict: verdictSchema,
  summary: z.array(hindiText).length(5),
  risky_clauses: z.array(riskyClauseSchema).max(15),
  questions: z.array(hindiText).length(3),
});
export const modelResultSchema = analysisContentSchema.extend({ readable: z.boolean() });
export const savedAnalysisSchema = analysisContentSchema.omit({ summary: true }).extend({
  id: z.string().uuid(),
  created_at: z.string(),
  summary: z.string().min(1),
});
export type Analysis = z.infer<typeof savedAnalysisSchema>;
export type Verdict = z.infer<typeof verdictSchema>;

export function validFileSignature(dataUrl: string, mimeType: string): boolean {
  const encoded = dataUrl.split(",")[1];
  if (!encoded) return false;
  try {
    const prefix = atob(encoded.slice(0, 32));
    if (mimeType === "application/pdf") return prefix.startsWith("%PDF-");
    if (mimeType === "image/jpeg") return prefix.startsWith("\xff\xd8\xff");
    if (mimeType === "image/png") return prefix.startsWith("\x89PNG\r\n\x1a\n");
    if (mimeType === "image/webp") return prefix.startsWith("RIFF") && prefix.slice(8, 12) === "WEBP";
    return false;
  } catch {
    return false;
  }
}

export const documentInputSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("text"), text: z.string().trim().min(30, "Add at least 30 characters of document text.").max(MAX_TEXT_LENGTH) }),
  z.object({
    kind: z.literal("file"),
    name: z.string().min(1).max(200),
    mimeType: z.enum(SUPPORTED_TYPES),
    dataUrl: z.string().max(Math.ceil(MAX_FILE_BYTES / 3) * 4 + 100).regex(/^data:(application\/pdf|image\/(jpeg|png|webp));base64,[A-Za-z0-9+/]+={0,2}$/),
  }).superRefine((value, ctx) => {
    if (!value.dataUrl.startsWith(`data:${value.mimeType};base64,`) || !validFileSignature(value.dataUrl, value.mimeType)) {
      ctx.addIssue({ code: "custom", message: "This file is not a valid PDF, JPG, PNG, or WEBP document." });
    }
    const encoded = value.dataUrl.split(",")[1] ?? "";
    const padding = encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0;
    if (encoded.length * 3 / 4 - padding > MAX_FILE_BYTES) {
      ctx.addIssue({ code: "custom", message: "Choose a file smaller than 10 MB." });
    }
  }),
]);
export type DocumentInput = z.infer<typeof documentInputSchema>;

export const verdictDetails = {
  green: { label: "Looks clear", hindi: "बड़ी चिंता नहीं दिखी", description: "No major risks were identified in the supplied text. Check the full document before signing." },
  yellow: { label: "Pause & clarify", hindi: "पहले कुछ बातें साफ़ कर लें", description: "Some terms need a closer look. Get clear answers before making a decision." },
  red: { label: "Proceed with caution", hindi: "सावधानी ज़रूरी है", description: "Significant risks were found. Consider speaking with a qualified legal professional." },
} satisfies Record<Verdict, { label: string; hindi: string; description: string }>;

export const SAMPLE_DOCUMENT = `RENT AGREEMENT — SAMPLE\nMonthly rent: INR 15,000. Security deposit: INR 60,000. Term: 11 months. The landlord may increase rent at any time without notice. The tenant must pay for all repairs, including structural repairs. The security deposit is non-refundable under all circumstances. The landlord may terminate this agreement with 24 hours' notice, but the tenant must give 90 days' notice. Late payment attracts a penalty of INR 1,000 per day. No personal information is included in this sample.`;