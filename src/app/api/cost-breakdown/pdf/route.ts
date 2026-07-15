import { CostBreakdownPdf } from "@/lib/pdf/templates/CostBreakdown";
import { pdfResponse } from "@/lib/pdf/generatePdf";

export async function GET() {
  const generatedAt = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return pdfResponse(
    CostBreakdownPdf({ generatedAt }),
    "ERP-Infrastructure-Cost-Breakdown"
  );
}
