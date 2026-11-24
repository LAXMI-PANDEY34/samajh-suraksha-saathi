import { describe, expect, it } from "vitest";
import { analysisContentSchema, documentInputSchema, verdictSchema } from "@/lib/document-analysis";

const explanation = {
  document_type: "Rent agreement", verdict: "yellow",
  summary: ["यह किराये का समझौता है।", "किराया हर महीने देना होगा।", "जमा राशि वापस मिलने की शर्त साफ़ नहीं है।", "मरम्मत का खर्च किरायेदार देगा।", "हस्ताक्षर से पहले शर्तें साफ़ करें।"],
  risky_clauses: [{ clause_text: "Deposit is non-refundable", explanation: "आपकी जमा राशि वापस नहीं मिलेगी।" }],
  questions: ["जमा राशि कब वापस मिलेगी?", "मरम्मत का खर्च कौन देगा?", "किराया कब बढ़ेगा?"],
};

describe("Samajh document rules", () => {
  it("requires exactly five summary lines", () => {
    expect(analysisContentSchema.safeParse(explanation).success).toBe(true);
    expect(analysisContentSchema.safeParse({ ...explanation, summary: explanation.summary.slice(0, 4) }).success).toBe(false);
    expect(analysisContentSchema.safeParse({ ...explanation, summary: [...explanation.summary, "एक और बात।"] }).success).toBe(false);
  });
  it("requires exactly three questions", () => {
    expect(analysisContentSchema.safeParse({ ...explanation, questions: explanation.questions.slice(0, 2) }).success).toBe(false);
    expect(analysisContentSchema.safeParse({ ...explanation, questions: [...explanation.questions, "कब?"] }).success).toBe(false);
    expect(analysisContentSchema.safeParse(explanation).success).toBe(true);
  });
  it("only accepts green, yellow, or red verdicts", () => {
    for (const verdict of ["green", "yellow", "red"]) expect(verdictSchema.safeParse(verdict).success).toBe(true);
    expect(verdictSchema.safeParse("approved").success).toBe(false);
  });
  it("requires Hindi in the summary, risk explanations, and questions", () => {
    expect(analysisContentSchema.safeParse({ ...explanation, summary: Array(5).fill("English only") }).success).toBe(false);
    expect(analysisContentSchema.safeParse({ ...explanation, questions: Array(3).fill("English only?") }).success).toBe(false);
    expect(analysisContentSchema.safeParse({ ...explanation, risky_clauses: [{ clause_text: "Deposit", explanation: "English only" }] }).success).toBe(false);
  });
  it("accepts pasted document text without any login fields", () => {
    expect(documentInputSchema.safeParse({ kind: "text", text: "A rent agreement for eleven months at INR 15000 per month." }).success).toBe(true);
  });
  it("accepts PDF and photo documents and rejects disguised files", () => {
    for (const [mimeType, prefix] of [["application/pdf", "%PDF-1.7\n"], ["image/jpeg", "\xff\xd8\xff\xe0"], ["image/png", "\x89PNG\r\n\x1a\n"], ["image/webp", "RIFF1234WEBP"]]) {
      expect(documentInputSchema.safeParse({ kind: "file", name: "document", mimeType, dataUrl: `data:${mimeType};base64,${btoa(prefix ?? "")}` }).success).toBe(true);
    }
    expect(documentInputSchema.safeParse({ kind: "file", name: "fake.pdf", mimeType: "application/pdf", dataUrl: `data:application/pdf;base64,${btoa("not a PDF")}` }).success).toBe(false);
  });
});