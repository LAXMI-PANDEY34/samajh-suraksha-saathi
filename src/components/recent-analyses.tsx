import { ArrowUpRight, FileClock, FileText, History, LoaderCircle, RotateCw } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { analysesQueryOptions } from "@/lib/analyses-query";
import { verdictDetails, type Analysis } from "@/lib/document-analysis";

export function RecentAnalyses({ onSelect }: { onSelect: (analysis: Analysis) => void }) {
  const { data, isFetching, refetch } = useSuspenseQuery(analysesQueryOptions);
  return (
    <section id="recent-analyses" className="recent-section">
      <div className="section-heading">
        <h2><History /> Recent analyses</h2>
        <div className="flex items-center gap-2"><span className="text-[10px] text-muted-foreground">Public archive</span><Button variant="ghost" size="icon" aria-label="Refresh recent analyses" title="Refresh recent analyses" disabled={isFetching} onClick={() => void refetch()}>{isFetching ? <LoaderCircle className="spinner" /> : <RotateCw className="size-3.5" />}</Button></div>
      </div>
      {data.error ? <div className="error-message" role="alert"><span>{data.error}</span></div> : !data.analyses.length ? (
        <div className="history-empty"><FileClock /><div><p>A fresh start. No analyses yet.</p><p>Your next bit of clarity will appear here.</p></div></div>
      ) : <div className="recent-grid">{data.analyses.map((analysis) => (
        <Button variant="history" key={analysis.id} className="recent-item" onClick={() => onSelect(analysis)}>
          <span className="recent-icon"><FileText /></span>
          <span className="recent-copy"><strong>{analysis.document_type}</strong><small><i aria-hidden="true" className={`verdict-dot ${analysis.verdict}`} />{verdictDetails[analysis.verdict].label}<span aria-hidden="true">·</span><time dateTime={analysis.created_at}>{new Date(analysis.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" })}</time></small></span><ArrowUpRight />
        </Button>
      ))}</div>}
    </section>
  );
}