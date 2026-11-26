import { describe, expect, it } from "vitest";
import { publicDatabase } from "@/lib/public-database";

const url = import.meta.env['VITE_SUPABASE_URL'];
const key = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'];
const database = url && key ? publicDatabase(url, key) : null;
const fixture = {
  document_type: "Rent agreement",
  verdict: "yellow",
  summary: Array<string>(5).fill("यह एक शर्त है।").join("\n"),
  risky_clauses: [{ clause_text: "Deposit is non-refundable", explanation: "जमा राशि वापस नहीं मिलेगी।" }],
  questions: ["किराया कितना है?", "जमा राशि कब मिलेगी?", "खर्च कौन देगा?"],
};

// Integration tests exercise the live public role; invalid writes cannot persist.
describe.skipIf(!database)("public analysis access", () => {
  const cases = [
    { name: "accepts valid analysis content", patch: {}, expected: true },
    { name: "rejects unknown document types", patch: { document_type: "arbitrary record" }, expected: false },
    { name: "rejects invalid verdicts", patch: { verdict: "approved" }, expected: false },
    { name: "requires five summary lines", patch: { summary: "यह एक पंक्ति है।" }, expected: false },
    { name: "requires Hindi summary lines", patch: { summary: Array<string>(5).fill("English only").join("\n") }, expected: false },
    { name: "requires three questions", patch: { questions: [] }, expected: false },
    { name: "requires Hindi questions", patch: { questions: ["one", "two", "three"] }, expected: false },
    { name: "rejects malformed risks", patch: { risky_clauses: [{ clause_text: 42, explanation: null }] }, expected: false },
    { name: "rejects non-array risks", patch: { risky_clauses: {} }, expected: false },
    { name: "rejects hidden risk fields", patch: { risky_clauses: [{ ...fixture.risky_clauses[0], extra: "unexpected" }] }, expected: false },
    { name: "allows no identified risks", patch: { risky_clauses: [] }, expected: true },
  ];

  for (const testCase of cases) {
    it(testCase.name, async () => {
      if (!database) throw new Error("Public test configuration missing");
      const { data, error } = await database.rpc("is_valid_analysis_content", { ...fixture, ...testCase.patch });
      expect(error).toBeNull();
      expect(data).toBe(testCase.expected);
    });
  }

  it("blocks a direct public insert that bypasses app validation", async () => {
    if (!database) throw new Error("Public test configuration missing");
    const { error } = await database.from("analyses").insert({
      ...fixture,
      summary: "Unvalidated arbitrary content",
    });
    expect(error?.code).toBe("42501");
  });

  it("keeps public history readable", async () => {
    if (!database) throw new Error("Public test configuration missing");
    const { data, error } = await database.from("analyses").select("id").limit(1);
    expect(error).toBeNull();
    expect(data).toBeInstanceOf(Array);
  });
});