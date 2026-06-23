#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ─── Load .env.local ─────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length && !key.startsWith('#')) process.env[key.trim()] = rest.join('=').trim();
  });
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dashboard-gestao-notas';
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const userId = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

if (!userId) {
  console.error('Use: node scripts/migrate-supabase-to-firestore-rest.mjs <firebase-user-id> [email] [password]');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Configure SUPABASE_URL e SUPABASE_ANON_KEY no .env.local');
  process.exit(1);
}

// ─── Firebase Auth (REST) ────────────────────────
let ID_TOKEN = null;

async function authenticate() {
  if (!email || !password || !API_KEY) {
    console.log('Sem email/senha ou API key — tentando sem auth.\n');
    return;
  }
  try {
    console.log(`Autenticando como ${email}...`);
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Erro');
    ID_TOKEN = data.idToken;
    console.log('Autenticado.\n');
  } catch (err) {
    console.error('Falha na autenticação:', err.message, '\n');
  }
}

// ─── Firestore REST helpers ──────────────────────
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function firestoreSet(path, data) {
  const headers = { 'Content-Type': 'application/json' };
  if (ID_TOKEN) headers['Authorization'] = `Bearer ${ID_TOKEN}`;

  // Converte valores para o formato REST do Firestore
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === null || v === undefined) {
      fields[k] = { nullValue: null };
    } else if (typeof v === 'number') {
      fields[k] = { integerValue: String(Math.round(v)) };
    } else if (typeof v === 'boolean') {
      fields[k] = { booleanValue: v };
    } else if (v?.constructor?.name === 'Timestamp' || v?._methodName === 'serverTimestamp') {
      fields[k] = { timestampValue: new Date().toISOString() };
    } else if (Array.isArray(v)) {
      fields[k] = { arrayValue: { values: v.map(item => typeof item === 'number'
        ? { integerValue: String(Math.round(item)) }
        : typeof item === 'object' ? { mapValue: { fields: Object.fromEntries(Object.entries(item).map(([ik, iv]) => [ik, { stringValue: String(iv) }])) } }
        : { stringValue: String(item) }
      )} };
    } else if (typeof v === 'object' && v !== null) {
      const nested = {};
      for (const [nk, nv] of Object.entries(v)) {
        nested[nk] = { stringValue: String(nv) };
      }
      fields[k] = { mapValue: { fields: nested } };
    } else {
      fields[k] = { stringValue: String(v) };
    }
  }

  const url = `${BASE}/${path}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firestore REST error ${res.status}: ${err.slice(0, 200)}`);
  }
  return res.json();
}

// ─── Helpers ─────────────────────────────────────
async function gerarLoginKey(login) {
  const encoded = new TextEncoder().encode(login);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Fetch Supabase ──────────────────────────────
async function fetchSupabase() {
  console.log('Buscando correcoes do Supabase...');
  const url = `${SUPABASE_URL}/rest/v1/corrections?select=*&order=createdAt.desc`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase error ${res.status}`);
  const data = await res.json();
  console.log(`   ${data.length} correcoes encontradas.\n`);
  return data;
}

// ─── Migrate ─────────────────────────────────────
async function migrate() {
  console.log('Migracao Supabase -> Firestore (REST API)...\n');
  await authenticate();

  let corrections;
  try { corrections = await fetchSupabase(); } catch (err) {
    console.error('Erro ao buscar Supabase:', err.message);
    process.exit(1);
  }
  if (corrections.length === 0) { console.log('Nenhuma correcao para migrar.'); return; }

  let imported = 0, errors = 0;

  for (const c of corrections) {
    try {
      const nome = c.studentName || 'Estudante';
      const turma = c.studentClass || 'N/A';
      const scoreData = Array.isArray(c.scoreData) ? c.scoreData : [];

      const primeiro = nome.split(' ')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const loginAluno = `${primeiro}_migrado`;
      const loginKey = await gerarLoginKey(loginAluno);

      const scoreItems = scoreData.map(s => ({
        subject: s.subject || 'C1',
        A: s.A || 0,
        fullMark: s.fullMark || 200
      }));

      // 1. Salva correcao
      await firestoreSet(`professores/${userId}/correcoes/${loginKey}`, {
        id: loginKey,
        userId,
        studentName: nome,
        studentClass: turma,
        essayTheme: c.essayTheme || 'Geral',
        result: c.result || '',
        scoreData: scoreItems,
        totalScore: c.totalScore || 0,
        loginAluno,
        createdAt: { _methodName: 'serverTimestamp' },
        _supabaseId: c.id,
      });

      // 2. Cria vinculo aluno
      await firestoreSet(`alunoLogin/${loginKey}`, {
        nome,
        login: loginAluno,
      });

      await firestoreSet(`alunoLogin/${loginKey}/vinculos/${userId}`, {
        professorUid: userId,
        turmaId: turma,
        modulo: 'redacao',
        nomeProfessor: 'Professor (migrado)',
        atualizadoEm: { _methodName: 'serverTimestamp' },
      });

      imported++;
      console.log(`   [${imported}/${corrections.length}] ${nome} — ${c.totalScore || 0}/1000`);
    } catch (err) {
      errors++;
      console.error(`   ERRO "${c.studentName}": ${err.message}`);
    }
  }

  console.log(`\nConcluido: ${imported} importadas, ${errors} erros.`);
  console.log(`Firestore: professores/${userId}/correcoes/*`);
}

migrate().catch(console.error);
