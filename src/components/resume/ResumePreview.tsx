"use client";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export default function ResumePreview({ url }: { url?: string }) {
  if (!url) return null;
  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-3">
      <p className="text-xs opacity-70 mb-2">Resume preview</p>
      <div className="overflow-auto max-h-[60vh]">
        <Document file={url}>
          <Page pageNumber={1} width={640} />
        </Document>
      </div>
    </div>
  );
}
