"use client";

import { X, Download } from "lucide-react";
import { useTranslations } from "next-intl";

export function PDFPreviewModal({
  pdfUrl,
  onClose,
}: {
  pdfUrl: string;
  onClose: () => void;
}) {
  const t = useTranslations("common");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden border border-border-color">
        <div className="flex items-center justify-between px-4 h-14 border-b border-border-color">
          <span className="text-sm font-semibold text-fg">{t("preview")}</span>
          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              download
              className="flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg px-2 py-1"
            >
              <Download size={16} /> {t("download")}
            </a>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-alt text-fg-muted"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <iframe src={pdfUrl} className="flex-1 w-full bg-white" />
      </div>
    </div>
  );
}
