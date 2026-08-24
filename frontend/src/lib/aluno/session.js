import crypto from 'crypto';

const SESSION_SECRET = process.env.ALUNO_SESSION_SECRET || process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || 'simuladoapp_edu_super_secure_secret_key_2026_auth';
const COOKIE_NAME = 'aluno_session';
const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 dias

/**
 * Cria um token assinado criptograficamente com HMAC-SHA256.
 * Formato: base64(payload).base64(signature)
 */
export function signSessionToken(payload) {
  const data = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS,
    iat: Math.floor(Date.now() / 1000),
  };

  const payloadB64 = Buffer.from(JSON.stringify(data)).toString('base64url');
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(payloadB64);
  const signatureB64 = hmac.digest('base64url');

  return `${payloadB64}.${signatureB64}`;
}

/**
 * Verifica e decodifica o token de sessão do aluno.
 * Retorna o payload se válido ou null se corrompido/expirado.
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signatureB64] = parts;

  // Verifica assinatura
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(payloadB64);
  const expectedSig = hmac.digest('base64url');

  if (signatureB64 !== expectedSig) {
    return null; // Assinatura inválida (tentativa de adulteração)
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    
    // Verifica expiração
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Token expirado
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Helper para extrair o token do cookie da requisição
 */
export function getSessionFromRequest(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );

  const token = cookies[COOKIE_NAME];
  return verifySessionToken(token);
}

export { COOKIE_NAME, TOKEN_EXPIRY_SECONDS };
