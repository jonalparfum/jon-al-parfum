import { getAdminReportData } from "@/lib/admin-report";
import { buildAdminReportPdf } from "@/lib/admin-report-pdf";
import { requireAdmin, unauthorized } from "@/lib/api-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  try {
    const data = await getAdminReportData();
    const pdf = await buildAdminReportPdf(data);

    const filename = `jon-al-parfum-reporte-${data.generatedAt
      .toISOString()
      .slice(0, 10)}.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    return NextResponse.json(
      { error: "No se pudo generar el reporte PDF" },
      { status: 500 }
    );
  }
}
