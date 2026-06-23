let _pdfjsLib = null;

async function getPdfjsLib() {
  if (_pdfjsLib) return _pdfjsLib;
  _pdfjsLib = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs');
  _pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(
    new Blob([worker.default || ''], { type: 'text/javascript' })
  );
  return _pdfjsLib;
}

export async function extractTextFromPDF(file) {
  if (typeof window === 'undefined') return '';
  const pdfjsLib = await getPdfjsLib();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const parts = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map(item => item.str).join(' ').replace(/\s+/g, ' ').trim();
    if (text) parts.push(text);
  }
  return parts.join('\n\n');
}
