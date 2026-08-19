import * as XLSX from 'xlsx';
import { cleanNome } from './calculos';

const NOME_HINTS = ['nome', 'aluno', 'student', 'name', 'estudante'];
const DATA_HINTS = ['nascimento', 'nasc', 'data', 'birthday', 'birth', 'dn', 'ddmm', 'dt_nasc', 'data_nasc'];

const detectCol = (header, hints) => {
  const lower = header.map((h) => String(h || '').toLowerCase().trim());
  for (const hint of hints) {
    const idx = lower.findIndex((h) => h.includes(hint));
    if (idx !== -1) return idx;
  }
  return -1;
};

/**
 * Extrai ddMM de diversos formatos de data:
 * - "0704" ou "704" → "0704"
 * - "07/04" ou "07-04" → "0704"
 * - "07/04/2010" → "0704"
 * - Date object (Excel) → "ddMM"
 */
const parseDateToddMM = (val) => {
  if (val == null || val === '') return null;

  // Se for uma Date (Excel serializa datas assim)
  if (val instanceof Date) {
    const dd = String(val.getDate()).padStart(2, '0');
    const mm = String(val.getMonth() + 1).padStart(2, '0');
    return `${dd}${mm}`;
  }

  // Se for número (Excel date serial)
  if (typeof val === 'number' && val > 10000) {
    const d = new Date((val - 25569) * 86400 * 1000);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return `${dd}${mm}`;
    }
  }

  const str = String(val).trim();
  // Remove separadores e pega só dígitos
  const digits = str.replace(/[\\/\-. ]/g, '');

  // "0704" ou "704" → ddMM
  if (/^\d{3,4}$/.test(digits)) {
    return digits.padStart(4, '0');
  }

  // "07042010" ou "07/04/2010" → pega os 4 primeiros dígitos (ddMM)
  if (/^\d{5,8}$/.test(digits)) {
    return digits.slice(0, 4);
  }

  return null;
};

/**
 * Importa alunos de planilha XLSX/CSV.
 * Retorna array de objetos: { nome: string, dataNascimento?: string }
 * (compatível com addAlunos que aceita tanto strings quanto objetos)
 */
export const importarXlsxOuCsv = (arquivo) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        if (!rows.length) return resolve([]);

        const [headerRow, ...dataRows] = rows;
        const nomeIdx = detectCol(headerRow, NOME_HINTS);
        const colIdx = nomeIdx !== -1 ? nomeIdx : 0;
        const dataIdx = detectCol(headerRow, DATA_HINTS);

        const alunos = dataRows
          .map((r) => {
            const nome = String(r[colIdx] || '').trim();
            if (nome.length <= 3 || /^\d+$/.test(nome)) return null;

            const resultado = { nome: cleanNome(nome) };

            if (dataIdx !== -1 && r[dataIdx] != null) {
              const ddMM = parseDateToddMM(r[dataIdx]);
              if (ddMM && ddMM.length === 4) {
                resultado.dataNascimento = ddMM;
              }
            }

            return resultado;
          })
          .filter(Boolean);

        // Deduplica por nome normalizado
        const seen = new Set();
        const unicos = alunos.filter(a => {
          const key = a.nome.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        resolve(unicos);
      } catch (err) {
        reject(new Error('Erro ao ler planilha: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsArrayBuffer(arquivo);
  });

