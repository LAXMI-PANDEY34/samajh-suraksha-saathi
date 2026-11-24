import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpenCheck, Building2, FileHeart, FileText, Heart, History, Landmark, LockKeyhole, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { DocumentInput } from "@/components/document-input";
import { DocumentIllustration } from "@/components/document-illustration";
import { AnalysisResults } from "@/components/analysis-results";
import { RecentAnalyses } from "@/components/recent-analyses";
import { analysesQueryOptions } from "@/lib/analyses-query";
import { analyzeDocument } from "@/lib/analyses.functions";
import type { Analysis, DocumentInput as DocumentPayload } from "@/lib/document-analysis";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Samajh — Your documents, simply understood" },
    { name: "description", content: "Understand rent agreements, loan letters, bank notices, insurance policies, and hospital bills in simple Hindi. Find risky clauses and questions to ask before signing." },
    { property: "og:title", content: "Samajh — Your documents, simply understood" },
    { property: "og:description", content: "A little clarity before you sign. Simple Hindi summaries, important risks, and the right questions to ask." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(analysesQueryOptions),
  component: Index,
});

function Index() {
  const [selected, setSelected] = useState<Analysis | null>(null);
  const [saved, setSaved] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runAnalysis = useServerFn(analyzeDocument);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (selected) document.getElementById("analysis-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selected]);

  function newAnalysis() {
    setSelected(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function analyze(input: DocumentPayload) {
    setLoading(true);
    setError(null);
    try {
      const result = await runAnalysis({ data: input });
      if (!result.success) { setError(result.error); return; }
      setSelected(result.analysis);
      setSaved(result.saved);
      if (result.saved) await queryClient.invalidateQueries({ queryKey: analysesQueryOptions.queryKey });
    } catch {
      setError("Samajh couldn't finish your analysis. Your document is still here — please try again.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="site-header">
        <div className="page-width header-inner">
          <a className="wordmark" href="#" aria-label="Samajh home" onClick={(event) => { event.preventDefault(); newAnalysis(); }}><span className="logo-symbol"><BookOpenCheck /></span><span className="brand-name">Samajh</span><span className="brand-divider" /><span className="brand-hindi" lang="hi">समझ</span></a>
          <nav className="top-navigation" aria-label="Main navigation"><a href="#analyze" aria-current="page" onClick={() => { if (selected) newAnalysis(); }}>Analyze document</a><a href="#recent-analyses"><History className="size-3.5" />Recent analyses</a></nav>
          <div className="header-note"><LockKeyhole /> No sign-up. Just clarity.</div>
        </div>
      </header>
      <main className="page-width flex-1" id="analyze">
        <div className="intro">
          <p className="eyebrow"><Sparkles /> A little clarity goes a long way</p>
          <h1>Your documents.<br /><span>Simply understood.</span></h1>
          <p className="intro-description">The fine print shouldn’t stand between you and a good decision.<br className="hidden sm:block" /> Get to the important bits, in simple Hindi.</p>
        </div>
        {selected ? <AnalysisResults analysis={selected} saved={saved} onNew={newAnalysis} /> : <>
          <div className="workspace">
            <DocumentInput loading={loading} error={error} onAnalyze={analyze} clearError={() => setError(null)} />
            <aside className="clarity-aside">
              <DocumentIllustration />
              <h2>A little understanding.<br />A lot more confidence.</h2>
              <p lang="hi">क्योंकि हर दस्तख़त से पहले,<br />समझना ज़रूरी है।</p>
              <div className="verdict-key" aria-label="Verdict meanings"><span><i className="verdict-dot green" />Looks clear</span><span><i className="verdict-dot yellow" />Take a closer look</span><span><i className="verdict-dot red" />Be cautious</span></div>
            </aside>
          </div>
          <div className="document-categories"><span><Building2 />Rent agreements</span><span><Landmark />Loan letters & bank notices</span><span><FileHeart />Insurance policies</span><span><Stethoscope />Hospital bills</span></div>
        </>}
        <RecentAnalyses onSelect={(analysis) => { setSelected(analysis); setSaved(true); }} />
      </main>
      <footer className="site-footer"><div className="page-width footer-inner"><span className="footer-brand"><BookOpenCheck />Samajh <span aria-hidden="true">·</span> समझें, फिर फैसला लें।</span><span className="footer-disclaimer"><ShieldCheck />This is not legal advice.</span><span className="flex items-center gap-1.5">Made for everyday decisions <Heart className="size-3 text-primary" /></span></div></footer>
    </div>
  );
}
