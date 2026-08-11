import PDFDocument from "pdfkit";
import type { AdminReportData } from "@/lib/admin-report";

type PdfDoc = InstanceType<typeof PDFDocument>;

const GOLD = "#c9a962";
const CHARCOAL = "#1a1816";
const CREAM = "#f5f0e8";
const MUTED = "#888880";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

function formatDate(date: Date) {
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  PROCESSING: "Procesando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

function sectionTitle(doc: PdfDoc, title: string) {
  doc.moveDown(0.8);
  doc
    .fontSize(13)
    .fillColor(CHARCOAL)
    .font("Helvetica-Bold")
    .text(title.toUpperCase(), { characterSpacing: 1 });
  doc
    .moveTo(doc.page.margins.left, doc.y + 4)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 4)
    .strokeColor(GOLD)
    .lineWidth(1.5)
    .stroke();
  doc.moveDown(0.6);
}

function statBox(
  doc: PdfDoc,
  x: number,
  y: number,
  w: number,
  label: string,
  value: string
) {
  doc.roundedRect(x, y, w, 52, 4).fillColor("#f8f6f2").fill();
  doc.roundedRect(x, y, w, 52, 4).strokeColor(GOLD).lineWidth(0.5).stroke();
  doc
    .fontSize(8)
    .fillColor(MUTED)
    .font("Helvetica")
    .text(label.toUpperCase(), x + 10, y + 10, { width: w - 20, characterSpacing: 0.5 });
  doc
    .fontSize(14)
    .fillColor(CHARCOAL)
    .font("Helvetica-Bold")
    .text(value, x + 10, y + 26, { width: w - 20 });
}

export async function buildAdminReportPdf(
  data: AdminReportData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: "Reporte Global — Jon Al Parfum",
        Author: "Jon Al Parfum Admin",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // Header band
    doc.rect(0, 0, doc.page.width, 90).fill(CHARCOAL);
    doc.rect(0, 86, doc.page.width, 4).fill(GOLD);
    doc
      .fontSize(22)
      .fillColor(GOLD)
      .font("Helvetica-Bold")
      .text("Jon Al Parfum", 50, 28);
    doc
      .fontSize(11)
      .fillColor(CREAM)
      .font("Helvetica")
      .text("Reporte global de operaciones", 50, 54);
    doc
      .fontSize(9)
      .fillColor(MUTED)
      .text(formatDate(data.generatedAt), 50, 70, { align: "left" });

    doc.y = 110;

    // KPI boxes
    const boxW = (pageWidth - 20) / 3;
    const startY = doc.y;
    statBox(doc, 50, startY, boxW, "Ingresos confirmados", formatMoney(data.sales.totalRevenue));
    statBox(doc, 50 + boxW + 10, startY, boxW, "Pedidos pagados", String(data.sales.paidOrders));
    statBox(
      doc,
      50 + (boxW + 10) * 2,
      startY,
      boxW,
      "Ticket promedio",
      formatMoney(data.sales.averageOrderValue)
    );
    doc.y = startY + 68;

    statBox(doc, 50, doc.y, boxW, "Productos activos", String(data.stock.activeProducts));
    statBox(doc, 50 + boxW + 10, doc.y, boxW, "Unidades en stock", String(data.stock.totalUnits));
    statBox(doc, 50 + (boxW + 10) * 2, doc.y, boxW, "Usuarios registrados", String(data.catalog.users));
    doc.y += 68;

    // Sales section
    sectionTitle(doc, "Resumen de ventas");
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(CHARCOAL)
      .text(`Pedidos pendientes: ${data.sales.pendingOrders}`, { continued: true })
      .text(`   ·   Cancelados: ${data.sales.cancelledOrders}`, { continued: false });

    if (data.sales.recentOrders.length > 0) {
      doc.moveDown(0.5);
      doc.fontSize(9).fillColor(MUTED).text("Últimos pedidos:");
      doc.moveDown(0.3);

      for (const order of data.sales.recentOrders) {
        const line = `#${order.id}  ·  ${order.customer}  ·  ${formatMoney(order.total)}  ·  ${statusLabels[order.status] ?? order.status}`;
        doc.fontSize(9).fillColor(CHARCOAL).font("Helvetica").text(line);
      }
    }

    // Top products
    if (data.topProducts.length > 0) {
      sectionTitle(doc, "Productos más vendidos");
      data.topProducts.forEach((p, i) => {
        doc
          .fontSize(10)
          .fillColor(CHARCOAL)
          .font("Helvetica")
          .text(
            `${i + 1}. ${p.name} — ${p.unitsSold} uds. · ${formatMoney(p.revenue)}`
          );
      });
    }

    // Stock section
    sectionTitle(doc, "Inventario");

    doc
      .fontSize(10)
      .fillColor(CHARCOAL)
      .text(
        `Total catálogo: ${data.stock.totalProducts} productos · ${data.catalog.categories} categorías · ${data.catalog.subcategories} subcategorías`
      );

    if (data.stock.lowStock.length > 0) {
      doc.moveDown(0.4);
      doc.fontSize(9).fillColor("#b45309").font("Helvetica-Bold").text("Stock bajo (≤10):");
      data.stock.lowStock.slice(0, 8).forEach((p) => {
        doc.font("Helvetica").fontSize(9).fillColor(CHARCOAL).text(`• ${p.name} (${p.category}) — ${p.stock} uds.`);
      });
    }

    if (data.stock.outOfStock.length > 0) {
      doc.moveDown(0.4);
      doc.fontSize(9).fillColor("#dc2626").font("Helvetica-Bold").text("Sin stock:");
      data.stock.outOfStock.slice(0, 8).forEach((p) => {
        doc.font("Helvetica").fontSize(9).fillColor(CHARCOAL).text(`• ${p.name} (${p.category})`);
      });
    }

    if (data.stock.lowStock.length === 0 && data.stock.outOfStock.length === 0) {
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor("#15803d").text("✓ Inventario en niveles saludables.");
    }

    // Recommendations - new page if needed
    if (doc.y > doc.page.height - 180) doc.addPage();

    sectionTitle(doc, "Recomendaciones");
    data.recommendations.forEach((rec, i) => {
      doc
        .fontSize(10)
        .fillColor(CHARCOAL)
        .font("Helvetica")
        .text(`${i + 1}. ${rec}`, { indent: 8, paragraphGap: 4 });
    });

    // Footer
    const footerY = doc.page.height - 40;
    doc
      .fontSize(8)
      .fillColor(MUTED)
      .font("Helvetica")
      .text(
        "Jon Al Parfum · Documento confidencial · Generado automáticamente desde el panel admin",
        50,
        footerY,
        { align: "center", width: pageWidth }
      );

    doc.end();
  });
}
