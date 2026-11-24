import { AlertTriangle, ArrowLeft, CheckCircle2, CircleHelp, FileText, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verdictDetails, type Analysis } from "@/lib/document-analysis";

export function AnalysisResults({ analysis, saved, onNew }: { analysis: Analysis; saved: boolean; onNew: () => void }) {
  const detail = verdictDetails[analysis.verdict];
  const VerdictIcon = analysis.verdict === "green" ? CheckCircle2 : analysis.verdict === "yellow" ? CircleHelp : ShieldAlert;
  return (
    <section className="results-section" id="analysis-result" aria-label="Document analysis">
      <div className="results-topline">
        <p>{analysis.document_type} <span aria-hidden="true"> / </span> Your document, decoded</p>
        <div className="result-actions"><Button variant="ghost" size="sm" onClick={onNew}><ArrowLeft /> New analysis</Button></div>
      </div>
      <div className={`verdict-banner verdict-${analysis.verdict}`} role="status">
        <VerdictIcon />
        <div><span className="verdict-eyebrow">The big picture · {analysis.verdict}</span><h2>{detail.label}</h2><p className="hindi-verdict" lang="hi">{detail.hindi}</p><p className="verdict-description">{detail.description}</p></div>
      </div>
      {!saved && <p className="save-warning" role="alert">Your analysis is ready, but couldn't be saved to recent analyses. Keep this page open to retain it.</p>}
      <div className="result-section mt-8">
        <h3><FileText /> In simple words</h3><p className="result-subheading">आपके दस्तावेज़ का आसान सार</p>
        <ol className="summary-lines" lang="hi">{analysis.summary.split("\n").filter(Boolean).map((line, index) => <li key={`${index}-${line}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{line}</p></li>)}</ol>
      </div>
      <div className="result-section risks-section">
        <h3><AlertTriangle /> The fine print <span className="text-sm font-normal text-muted-foreground">({analysis.risky_clauses.length})</span></h3><p className="result-subheading">इन शर्तों पर ध्यान दें</p>
        {analysis.risky_clauses.length ? <div className="risk-list">{analysis.risky_clauses.map((risk, index) => <article key={`${index}-${risk.clause_text}`} className="risk-item"><blockquote>“{risk.clause_text}”</blockquote><p lang="hi">{risk.explanation}</p></article>)}</div> : <p className="no-risks" lang="hi">दिए गए दस्तावेज़ में कोई बड़ी जोखिम भरी शर्त नहीं मिली। फिर भी पूरा दस्तावेज़ ध्यान से पढ़ें।</p>}
      </div>
      <div className="result-section mt-8">
        <h3><CircleHelp /> Before you sign</h3><p className="result-subheading">पहले ये 3 सवाल पूछें</p>
        <ol className="question-lines" lang="hi">{analysis.questions.map((question, index) => <li key={`${index}-${question}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{question}</p></li>)}</ol>
      </div>
    </section>
  );
}