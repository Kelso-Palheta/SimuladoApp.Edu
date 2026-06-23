import { jsPDF } from "jspdf";

type ScoreItem = { subject: string; A: number; fullMark: number };

export const generatePDF = (
  content: string,
  studentName: string = "Estudante",
  studentClass: string = "N/A",
  essayTheme: string = "Geral",
  scoreData?: ScoreItem[] | null
) => {
  const doc = new jsPDF("portrait", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxLineWidth = pageWidth - margin * 2;

  // ── HEADER ──
  doc.setFillColor(30, 10, 60);
  doc.rect(0, 0, pageWidth, 55, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("Relatório de Correção ENEM", margin, 20);

  doc.setFontSize(10);
  doc.setTextColor(200, 200, 240);
  doc.text("ALUNO(A): " + studentName.toUpperCase(), margin, 32);
  doc.text("TURMA: " + studentClass.toUpperCase(), margin, 38);
  doc.text("TEMA: " + essayTheme.toUpperCase(), margin, 44);
  doc.text("DATA: " + new Date().toLocaleDateString("pt-BR"), margin, 50);

  let cursorY = 65;

  // ── SCORES ──
  if (scoreData && scoreData.length > 0) {
    const totalScore = scoreData.reduce((acc, s) => acc + s.A, 0);

    doc.setFillColor(109, 40, 217);
    doc.roundedRect(margin, cursorY, maxLineWidth, 15, 2, 2, "F");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("NOTA FINAL: " + totalScore + " / 1000", pageWidth / 2, cursorY + 10, { align: "center" });

    cursorY += 25;

    const colW = maxLineWidth / 5;
    scoreData.forEach((s, i) => {
      const x = margin + i * colW;
      doc.setFillColor(245, 245, 255);
      doc.rect(x, cursorY, colW - 2, 20, "F");
      doc.setDrawColor(200, 200, 255);
      doc.rect(x, cursorY, colW - 2, 20, "S");

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 150);
      doc.text(s.subject, x + (colW - 2) / 2, cursorY + 7, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(30, 10, 60);
      doc.text(String(s.A), x + (colW - 2) / 2, cursorY + 15, { align: "center" });
    });
    cursorY += 30;
  }

  // ── CONTENT ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 10, 60);
  doc.text("ANALISE PEDAGOGICA", margin, cursorY);
  cursorY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 70);

  // Limpar markdown e caracteres especiais para o PDF
  const cleanContent = content
    .replace(/```json[\s\S]*?```/g, "")
    .replace(/\{[\s]*?"c1"[\s\S]*?\}/g, "")
    .replace(/^[| \-:]+[| \-:]+$/gm, "")
    .replace(/\|/g, " ")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/[^\x00-\x7F\u00C0-\u024F\u1E00-\u1EFF]/g, "") // Remove emojis
    .replace(/#{1,3}\s?/g, "") // Remove markdown headers
    .trim();

  const lines = doc.splitTextToSize(cleanContent, maxLineWidth);

  lines.forEach((line: string) => {
    if (cursorY > pageHeight - 25) {
      doc.addPage();
      cursorY = 20;
    }
    doc.text(line, margin, cursorY);
    cursorY += 5;
  });

  // ── FOOTER ──
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "Redação Corrigida ENEM 2026 - Página " + i + " de " + pageCount,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  // Gerar o blob e forçar download via link
  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Resultado_" + studentName.replace(/\s+/g, "_") + ".pdf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
