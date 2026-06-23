let _mammothPromise = null;

function getMammoth() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.mammoth) return Promise.resolve(window.mammoth);
  if (_mammothPromise) return _mammothPromise;

  _mammothPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js';
    script.async = true;
    script.onload = () => {
      resolve(window.mammoth);
    };
    script.onerror = (err) => {
      _mammothPromise = null;
      reject(new Error('Erro ao carregar biblioteca de leitura Word (Mammoth).'));
    };
    document.head.appendChild(script);
  });

  return _mammothPromise;
}

export async function extractTextFromDocx(file) {
  if (typeof window === 'undefined') return '';
  const mammothInstance = await getMammoth();
  if (!mammothInstance) throw new Error('Mammoth.js não pôde ser inicializado.');

  const arrayBuffer = await file.arrayBuffer();
  const result = await mammothInstance.extractRawText({ arrayBuffer });
  return result.value || '';
}
