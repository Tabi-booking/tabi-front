import { jsPDF } from "jspdf";
import autoTable, { type UserOptions } from "jspdf-autotable";
import type { ReportContext } from "@/modules/reportes/types/report";

const NAVY: [number, number, number] = [27, 38, 55];
const CORAL: [number, number, number] = [245, 94, 87];
const MUTED: [number, number, number] = [100, 116, 139];
const BORDER: [number, number, number] = [219, 227, 238];

const MARGIN = 14;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

let logoDataUrl: string | null = null;

export async function loadTabiLogo(): Promise<string> {
  if (logoDataUrl) return logoDataUrl;
  const response = await fetch("/img/tabi-logo-dark.png");
  const blob = await response.blob();
  logoDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  return logoDataUrl;
}

type JsPdfWithAutoTable = jsPDF & { lastAutoTable?: { finalY: number } };

function lastY(doc: jsPDF, fallback = 50): number {
  return (doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? fallback;
}

function addFooters(doc: jsPDF) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(...BORDER);
    doc.line(MARGIN, 282, PAGE_WIDTH - MARGIN, 282);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Tabi — Tu próxima mesa, a solo un clic.", MARGIN, 288);
    doc.text(`Página ${i} de ${total}`, PAGE_WIDTH - MARGIN, 288, { align: "right" });
  }
}

export function drawReportHeader(doc: jsPDF, ctx: ReportContext, title: string, logo: string) {
  doc.addImage(logo, "PNG", MARGIN, 12, 38, 11);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...CORAL);
  doc.text("REPORTE TABI", PAGE_WIDTH - MARGIN, 16, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`Generado: ${ctx.generatedAt}`, PAGE_WIDTH - MARGIN, 22, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...NAVY);
  doc.text(ctx.restaurantName, MARGIN, 32);

  doc.setFontSize(12);
  doc.text(title, MARGIN, 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`Periodo: ${ctx.periodLabel} (${getPeriodShort(ctx.period)})`, MARGIN, 47);

  doc.setDrawColor(...CORAL);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, 51, PAGE_WIDTH - MARGIN, 51);

  return 58;
}

function getPeriodShort(period: ReportContext["period"]): string {
  if (period === "today") return "Hoy";
  if (period === "7d") return "Últimos 7 días";
  return "Últimos 30 días";
}

export function addSectionTitle(doc: jsPDF, y: number, title: string): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(title, MARGIN, y);
  return y + 6;
}

export function addTable(
  doc: jsPDF,
  startY: number,
  head: string[][],
  body: (string | number)[][],
  options?: Partial<UserOptions>,
) {
  autoTable(doc, {
    startY,
    margin: { left: MARGIN, right: MARGIN },
    head,
    body,
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: NAVY,
      lineColor: BORDER,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    ...options,
  });
}

export function addBulletList(doc: jsPDF, startY: number, items: string[]): number {
  let y = startY;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  for (const item of items) {
    const lines = doc.splitTextToSize(`• ${item}`, CONTENT_WIDTH);
    doc.text(lines, MARGIN, y);
    y += lines.length * 5 + 2;
  }
  return y + 4;
}

export function ensureSpace(doc: jsPDF, y: number, needed = 40): number {
  if (y + needed > 272) {
    doc.addPage();
    return 20;
  }
  return y;
}

export function createReportDocument(): jsPDF {
  return new jsPDF({ unit: "mm", format: "a4" });
}

export function saveReport(doc: jsPDF, filename: string) {
  addFooters(doc);
  doc.save(filename);
}

export function getTableEndY(doc: jsPDF, fallback: number): number {
  return lastY(doc, fallback) + 8;
}
