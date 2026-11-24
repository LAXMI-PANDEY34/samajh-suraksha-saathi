import { useRef, useState } from "react";
import { ArrowRight, FileCheck2, FileText, ImagePlus, Info, LoaderCircle, Sparkles, Type, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { documentInputSchema, MAX_FILE_BYTES, MAX_TEXT_LENGTH, SAMPLE_DOCUMENT, SUPPORTED_TYPES, type DocumentInput as DocumentPayload } from "@/lib/document-analysis";

type Props = { loading: boolean; error: string | null; onAnalyze: (input: DocumentPayload) => Promise<void>; clearError: () => void };

export function DocumentInput({ loading, error, onAnalyze, clearError }: Props) {
  const [mode, setMode] = useState<"upload" | "text">("upload");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function chooseFile(candidate: File | undefined) {
    if (!candidate || loading) return;
    clearError();
    setLocalError(null);
    if (!SUPPORTED_TYPES.some((type) => type === candidate.type)) {
      setLocalError("Please choose a PDF, JPG, PNG, or WEBP file.");
      return;
    }
    if (candidate.size > MAX_FILE_BYTES) {
      setLocalError("This file is too large. Please choose one smaller than 10 MB.");
      return;
    }
    if (candidate.size === 0) {
      setLocalError("This file is empty. Please choose a different document.");
      return;
    }
    setFile(candidate);
  }

  async function submit() {
    setLocalError(null);
    clearError();
    try {
      let input: unknown;
      if (mode === "text") input = { kind: "text", text };
      else if (file) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Couldn't read this file."));
          reader.onerror = () => reject(new Error("Couldn't read this file. Please choose it again."));
          reader.readAsDataURL(file);
        });
        input = { kind: "file", name: file.name.slice(0, 200), mimeType: file.type, dataUrl };
      } else return;
      const parsed = documentInputSchema.safeParse(input);
      if (!parsed.success) {
        setLocalError(mode === "text" ? "Please add between 30 and 60,000 characters of document text." : "This file doesn't look valid. Please choose a readable PDF or photo smaller than 10 MB.");
        return;
      }
      await onAnalyze(parsed.data);
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : "We couldn't read your document. Please try again.");
    }
  }

  return (
    <div>
      <div className="input-tool" aria-busy={loading}>
        <div className="tool-tabs" role="tablist" aria-label="Document input method">
          <Button id="upload-tab" variant="tab" role="tab" aria-selected={mode === "upload"} aria-controls="upload-panel" data-active={mode === "upload"} disabled={loading} onClick={() => { setMode("upload"); setLocalError(null); clearError(); }}><ImagePlus /> Upload document</Button>
          <Button id="text-tab" variant="tab" role="tab" aria-selected={mode === "text"} aria-controls="text-panel" data-active={mode === "text"} disabled={loading} onClick={() => { setMode("text"); setLocalError(null); clearError(); }}><Type /> Paste text</Button>
        </div>
        <div className="tool-content">
          {mode === "upload" ? (
            <div id="upload-panel" role="tabpanel" aria-labelledby="upload-tab">
              <input ref={fileInput} className="sr-only" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" aria-label="Choose a document" disabled={loading} onChange={(event) => { chooseFile(event.target.files?.[0]); event.target.value = ""; }} />
              <div className={`drop-zone ${file ? "file-chosen" : ""}`} data-dragging={dragging} onDragOver={(event) => { event.preventDefault(); if (!loading) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]); }}>
                <div className="upload-icon">{file ? <FileCheck2 /> : <UploadCloud />}</div>
                <p className="drop-title">{file ? file.name : <>Drag & drop your document here</>}</p>
                <p className="drop-meta">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · Ready to understand` : "PDF, JPG, PNG or WEBP · Up to 10 MB"}</p>
                <div className="flex items-center gap-2">
                  <Button variant="upload" className="browse-button" disabled={loading} onClick={() => fileInput.current?.click()}>{file ? <FileText /> : <ImagePlus />}{file ? "Change document" : "Browse files"}</Button>
                  {file && <Button variant="ghost" size="icon" className="mt-4" aria-label="Remove document" title="Remove document" disabled={loading} onClick={() => setFile(null)}><X /></Button>}
                </div>
              </div>
            </div>
          ) : (
            <div id="text-panel" role="tabpanel" aria-labelledby="text-tab">
              <Textarea className="tool-textarea" aria-label="Document text" value={text} maxLength={MAX_TEXT_LENGTH} disabled={loading} placeholder="Paste your document text here…" onChange={(event) => { setText(event.target.value); setLocalError(null); clearError(); }} />
              <div className="text-counter"><span>English, Hindi, or another language</span><span>{text.length.toLocaleString("en-IN")} / 60,000</span></div>
            </div>
          )}
          <p className="privacy-note"><Info /><span>Analyses are public. Remove personal, financial, and medical details before submitting. Original documents aren’t saved.</span></p>
          {(localError || error) && <p className="error-message" role="alert"><Info /><span>{localError || error}</span></p>}
          <Button size="lg" className="analyze-button" disabled={loading || (mode === "upload" ? !file : !text.trim())} onClick={() => void submit()}>
            <span>{loading ? <LoaderCircle className="spinner" /> : <Sparkles />}{loading ? "Understanding your document…" : "Help me understand"}</span>{!loading && <ArrowRight />}
          </Button>
          {loading && <p role="status" className="processing-note">Reading carefully. A little clarity is on its way.</p>}
        </div>
      </div>
      <div className="sample-row"><span>Just looking around?</span><Button variant="link" disabled={loading} onClick={() => { setMode("text"); setText(SAMPLE_DOCUMENT); setLocalError(null); clearError(); }}>Try a sample document <ArrowRight className="size-3" /></Button></div>
    </div>
  );
}