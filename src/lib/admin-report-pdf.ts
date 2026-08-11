import PDFDocument from "pdfkit";
import type { AdminReportData } from "@/lib/admin-report";

type PdfDoc = InstanceType<typeof PDFDocument>;

const COLORS = {
  gold: "#c9a962",
  charcoal: "#1a1816",
  cream: "#f5f0e8",
  muted: "#6b7280",
  border: "#e5e7eb",
  headerBg: "#1a1816",
  rowAlt: "#fafaf9",
  warn: "#b45309",
  danger: "#dc2626",
  success: "#15803d",
};

const M = { top: 56, bottom: 64, left: 48, right: 48 };

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  PROCESSING: "Procesando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

function pageContentWidth(doc: PdfDoc) {
  return doc.page.width - M.left - M.right;
}

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

function formatShortDate(date: Date) {
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function truncate(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

function ensureSpace(doc: PdfDoc, needed: number) {
  if (doc.y + needed > doc.page.height - M.bottom) {
    doc.addPage();
    doc.y = M.top;
  }
}

function drawPageFooter(doc: PdfDoc, pageNum: number) {
  const y = doc.page.height - M.bottom + 18;
  const w = pageContentWidth(doc);

  doc
    .moveTo(M.left, y - 10)
    .lineTo(M.left + w, y - 10)
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .stroke();

  doc
    .fontSize(7.5)
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .text(
      "Jon Al Parfum  |  Documento confidencial  |  Generado desde el panel administrativo",
      M.left,
      y,
      { width: w, align: "center" }
    );

  doc.text(`P\u00e1gina ${pageNum}`, M.left, y, { width: w, align: "right" });
}

function drawPageHeader(doc: PdfDoc, generatedAt: Date) {
  const w = doc.page.width;

  doc.save();
  doc.rect(0, 0, w, 82).fill(COLORS.headerBg);
  doc.rect(0, 79, w, 3).fill(COLORS.gold);

  doc
    .fillColor(COLORS.gold)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Jon Al Parfum", M.left, 22, { lineBreak: false });

  doc
    .fillColor(COLORS.cream)
    .font("Helvetica")
    .fontSize(10)
    .text("Reporte global de operaciones", M.left, 44, { lineBreak: false });

  doc
    .fillColor("#9ca3af")
    .fontSize(8)
    .text(`Generado: ${formatDate(generatedAt)}`, M.left, 60, {
      lineBreak: false,
    });

  doc.restore();
  doc.y = 96;
}

function sectionTitle(doc: PdfDoc, title: string) {
  ensureSpace(doc, 48);
  doc.moveDown(0.4);

  const y = doc.y;
  doc
    .fontSize(11)
    .fillColor(COLORS.charcoal)
    .font("Helvetica-Bold")
    .text(title.toUpperCase(), M.left, y, {
      width: pageContentWidth(doc),
      characterSpacing: 0.8,
    });

  const lineY = doc.y + 3;
  doc
    .moveTo(M.left, lineY)
    .lineTo(M.left + pageContentWidth(doc), lineY)
    .strokeColor(COLORS.gold)
    .lineWidth(1.2)
    .stroke();

  doc.y = lineY + 12;
}

function drawKpiCard(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string
) {
  doc.save();
  doc.roundedRect(x, y, width, height, 5).fillColor("#faf8f5").fill();
  doc
    .roundedRect(x, y, width, height, 5)
    .strokeColor(COLORS.gold)
    .lineWidth(0.6)
    .stroke();

  doc
    .fontSize(7.5)
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .text(label.toUpperCase(), x + 10, y + 9, {
      width: width - 20,
      characterSpacing: 0.4,
      lineBreak: false,
    });

  doc
    .fontSize(13)
    .fillColor(COLORS.charcoal)
    .font("Helvetica-Bold")
    .text(value, x + 10, y + 24, {
      width: width - 20,
      lineBreak: false,
    });

  doc.restore();
}

function drawKpiGrid(
  doc: PdfDoc,
  items: { label: string; value: string }[]
) {
  const cols = 3;
  const gap = 10;
  const cardH = 50;
  const cw = pageContentWidth(doc);
  const cardW = (cw - gap * (cols - 1)) / cols;

  let startY = doc.y;
  let col = 0;

  for (const item of items) {
    const x = M.left + col * (cardW + gap);
    drawKpiCard(doc, x, startY, cardW, cardH, item.label, item.value);
    col += 1;
    if (col >= cols) {
      col = 0;
      startY += cardH + gap;
    }
  }

  doc.y = startY + (col > 0 ? cardH + gap : 0) + 4;
}

type TableColumn = {
  header: string;
  width: number;
  align?: "left" | "right" | "center";
};

function drawTable(
  doc: PdfDoc,
  columns: TableColumn[],
  rows: string[][]
) {
  const rowH = 22;
  const headerH = 24;
  const tableW = columns.reduce((s, c) => s + c.width, 0);

  ensureSpace(doc, headerH + rowH * Math.min(rows.length, 1) + 8);

  const drawHeader = (y: number) => {
    doc.save();
    doc.rect(M.left, y, tableW, headerH).fillColor("#f3f4f6").fill();
    doc
      .rect(M.left, y, tableW, headerH)
      .strokeColor(COLORS.border)
      .lineWidth(0.5)
      .stroke();

    let x = M.left;
    columns.forEach((col) => {
      doc
        .fontSize(8)
        .fillColor(COLORS.muted)
        .font("Helvetica-Bold")
        .text(col.header.toUpperCase(), x + 6, y + 7, {
          width: col.width - 12,
          align: col.align ?? "left",
          lineBreak: false,
        });
      x += col.width;
    });
    doc.restore();
  };

  let y = doc.y;
  drawHeader(y);
  y += headerH;

  rows.forEach((row, rowIndex) => {
    if (y + rowH > doc.page.height - M.bottom) {
      doc.addPage();
      doc.y = M.top;
      y = doc.y;
      drawHeader(y);
      y += headerH;
    }

    if (rowIndex % 2 === 1) {
      doc.rect(M.left, y, tableW, rowH).fillColor(COLORS.rowAlt).fill();
    }

    doc
      .rect(M.left, y, tableW, rowH)
      .strokeColor(COLORS.border)
      .lineWidth(0.4)
      .stroke();

    let x = M.left;
    row.forEach((cell, colIndex) => {
      const col = columns[colIndex];
      doc
        .fontSize(8.5)
        .fillColor(COLORS.charcoal)
        .font("Helvetica")
        .text(cell, x + 6, y + 6, {
          width: col.width - 12,
          align: col.align ?? "left",
          lineBreak: false,
        });
      x += col.width;
    });

    y += rowH;
  });

  doc.y = y + 10;
}

function drawBulletList(
  doc: PdfDoc,
  items: string[],
  options?: { color?: string; fontSize?: number }
) {
  const fontSize = options?.fontSize ?? 9;
  const color = options?.color ?? COLORS.charcoal;
  const lineH = fontSize + 6;

  items.forEach((item) => {
    ensureSpace(doc, lineH + 4);
    doc
      .fontSize(fontSize)
      .fillColor(color)
      .font("Helvetica")
      .text(`•  ${item}`, M.left + 4, doc.y, {
        width: pageContentWidth(doc) - 8,
        lineGap: 2,
      });
    doc.moveDown(0.15);
  });
}

function drawSummaryLine(doc: PdfDoc, label: string, value: string) {
  ensureSpace(doc, 18);
  const w = pageContentWidth(doc);
  const y = doc.y;

  doc
    .fontSize(9.5)
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .text(label, M.left, y, { width: w * 0.55, lineBreak: false });

  doc
    .fontSize(9.5)
    .fillColor(COLORS.charcoal)
    .font("Helvetica-Bold")
    .text(value, M.left + w * 0.55, y, {
      width: w * 0.45,
      align: "right",
      lineBreak: false,
    });

  doc.y = y + 16;
}

export async function buildAdminReportPdf(
  data: AdminReportData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: M.top, bottom: M.bottom, left: M.left, right: M.right },
      bufferPages: true,
      info: {
        Title: "Reporte Global — Jon Al Parfum",
        Author: "Jon Al Parfum Admin",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    drawPageHeader(doc, data.generatedAt);

    drawKpiGrid(doc, [
      { label: "Ingresos confirmados", value: formatMoney(data.sales.totalRevenue) },
      { label: "Pedidos pagados", value: String(data.sales.paidOrders) },
      { label: "Ticket promedio", value: formatMoney(data.sales.averageOrderValue) },
      { label: "Productos activos", value: String(data.stock.activeProducts) },
      { label: "Unidades en stock", value: String(data.stock.totalUnits) },
      { label: "Usuarios registrados", value: String(data.catalog.users) },
    ]);

    sectionTitle(doc, "Resumen de ventas");
    drawSummaryLine(doc, "Pedidos pendientes de pago", String(data.sales.pendingOrders));
    drawSummaryLine(doc, "Pedidos cancelados", String(data.sales.cancelledOrders));
    drawSummaryLine(doc, "Total pedidos en sistema", String(data.sales.paidOrders + data.sales.pendingOrders + data.sales.cancelledOrders));

    if (data.sales.recentOrders.length > 0) {
      doc.moveDown(0.2);
      const cw = pageContentWidth(doc);
      drawTable(
        doc,
        [
          { header: "ID", width: cw * 0.14 },
          { header: "Cliente", width: cw * 0.34 },
          { header: "Fecha", width: cw * 0.18 },
          { header: "Estado", width: cw * 0.18 },
          { header: "Total", width: cw * 0.16, align: "right" },
        ],
        data.sales.recentOrders.map((order) => [
          order.id,
          truncate(order.customer, 28),
          formatShortDate(order.date),
          statusLabels[order.status] ?? order.status,
          formatMoney(order.total),
        ])
      );
    }

    if (data.topProducts.length > 0) {
      sectionTitle(doc, "Productos mas vendidos");
      const cw = pageContentWidth(doc);
      drawTable(
        doc,
        [
          { header: "#", width: cw * 0.08, align: "center" },
          { header: "Producto", width: cw * 0.52 },
          { header: "Unidades", width: cw * 0.18, align: "right" },
          { header: "Ingresos", width: cw * 0.22, align: "right" },
        ],
        data.topProducts.map((p, i) => [
          String(i + 1),
          truncate(p.name, 42),
          String(p.unitsSold),
          formatMoney(p.revenue),
        ])
      );
    }

    sectionTitle(doc, "Inventario");
    drawSummaryLine(
      doc,
      "Productos en catalogo",
      `${data.stock.totalProducts} (${data.stock.activeProducts} activos)`
    );
    drawSummaryLine(
      doc,
      "Categorias / Subcategorias",
      `${data.catalog.categories} / ${data.catalog.subcategories}`
    );
    drawSummaryLine(doc, "Administradores", String(data.catalog.admins));

    if (data.stock.lowStock.length > 0) {
      doc.moveDown(0.3);
      doc
        .fontSize(9)
        .fillColor(COLORS.warn)
        .font("Helvetica-Bold")
        .text("Stock bajo (10 unidades o menos)", M.left, doc.y);
      doc.moveDown(0.35);
      drawBulletList(
        doc,
        data.stock.lowStock.slice(0, 10).map(
          (p) => `${truncate(p.name, 36)} (${p.category}) — ${p.stock} uds.`
        )
      );
    }

    if (data.stock.outOfStock.length > 0) {
      doc.moveDown(0.3);
      doc
        .fontSize(9)
        .fillColor(COLORS.danger)
        .font("Helvetica-Bold")
        .text("Sin stock", M.left, doc.y);
      doc.moveDown(0.35);
      drawBulletList(
        doc,
        data.stock.outOfStock.slice(0, 10).map(
          (p) => `${truncate(p.name, 36)} (${p.category})`
        )
      );
    }

    if (data.stock.lowStock.length === 0 && data.stock.outOfStock.length === 0) {
      doc.moveDown(0.3);
      doc
        .fontSize(9.5)
        .fillColor(COLORS.success)
        .font("Helvetica-Bold")
        .text("Inventario en niveles saludables.", M.left, doc.y);
      doc.moveDown(0.5);
    }

    sectionTitle(doc, "Recomendaciones");
    drawBulletList(
      doc,
      data.recommendations.map((r, i) => `${i + 1}. ${r}`),
      { fontSize: 9.5 }
    );

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      drawPageFooter(doc, i - range.start + 1);
    }

    doc.end();
  });
}
