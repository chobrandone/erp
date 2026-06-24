"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { PDFPreviewModal } from "@/components/shared/PDFPreviewModal";

export function PTICertificateClient({ id }: { id: string }) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg mt-2"
      >
        <FileText size={16} /> {t("print")}
      </button>
      {open && (
        <PDFPreviewModal pdfUrl={`/api/pti-inspections/${id}/pdf`} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
