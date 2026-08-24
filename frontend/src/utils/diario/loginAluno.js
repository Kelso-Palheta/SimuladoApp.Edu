const PREPOSICOES = new Set(['de', 'da', 'do', 'dos', 'das', 'e', 'd']);

/**
 * Gera o login padronizado do aluno com os 2 primeiros nomes reais + DDMM de nascimento.
 * Ignora preposições (de, da, do, dos, das, e) para evitar ambiguidades e colisões.
 * 
 * Exemplo:
 * - "Pedro Henrique Ribeiro Nascimento", "1111" -> "pedrohenrique1111"
 * - "Pedro Vitor Dos Santos Lima", "1111" -> "pedrovitor1111"
 * - "Maria Eduarda da Silva", "1503" -> "mariaeduarda1503"
 * - "Lucas", "2007" -> "lucas2007"
 */
export const gerarLoginAluno = (nomeCompleto = '', dataNascimento = '') => {
  if (!nomeCompleto) return '';

  const partes = String(nomeCompleto)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter((p) => p.length > 0 && !PREPOSICOES.has(p));

  // Pega até os 2 primeiros nomes reais (ex: pedro + henrique)
  const prefixo = partes.slice(0, 2).join('');
  const dnLimpo = String(dataNascimento || '').replace(/\D/g, '');

  return `${prefixo}${dnLimpo}`;
};

/**
 * Gera o hash SHA-256 da chave de login do aluno para identificação no Firestore.
 */
export const gerarLoginKey = async (login) => {
  if (!login) return '';
  const clean = String(login).trim().toLowerCase();
  const encoded = new TextEncoder().encode(clean);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};
