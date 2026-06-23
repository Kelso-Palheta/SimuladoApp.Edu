#!/usr/bin/env node
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, signInWithCustomToken, signInWithEmailAndPassword } from 'firebase/auth';
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
const userId = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

if (!userId) {
  console.error('Use: node scripts/migrate-supabase-to-firestore.mjs <firebase-user-id> [email] [password]');
  console.error('  Com email/senha, autentica no Firebase antes de escrever (recomendado).');
  console.error('  Sem email/senha, tenta escrever sem auth (precisa de regras abertas).');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Configure SUPABASE_URL e SUPABASE_ANON_KEY no .env.local');
  process.exit(1);
}

// ─── Firebase Init ───────────────────────────────
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// ─── Auth (opcional) ─────────────────────────────
async function authenticate() {
  if (!email || !password) {
    console.log('⚠️  Sem email/senha — tentando escrever sem autenticação.');
    console.log('   Se falhar, execute com: node scripts/migrate-supabase-to-firestore.mjs <uid> <email> <senha>\n');
    return;
  }
  const auth = getAuth(app);
  try {
    console.log(`Autenticando como ${email}...`);
    await signInWithEmailAndPassword(auth, email, password);
    console.log('Autenticado com sucesso.\n');
  } catch (err) {
    console.error('Falha na autenticação:', err.message);
    console.log('Continuando sem autenticação...\n');
  }
}

// ─── Helpers ─────────────────────────────────────
async function gerarLoginKey(login) {
  const encoded = new TextEncoder().encode(login);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function vincularAluno(login, nome, turmaId) {
  const loginKey = await gerarLoginKey(login);
  await setDoc(doc(db, 'alunoLogin', loginKey), { nome, login }, { merge: true });
  await setDoc(doc(db, 'alunoLogin', loginKey, 'vinculos', userId), {
    professorUid: userId, turmaId, modulo: 'redacao',
    nomeProfessor: 'Professor (migrado)', atualizadoEm: serverTimestamp()
  }, { merge: true });
  return loginKey;
}

// ─── Fetch Supabase ──────────────────────────────
async function fetchSupabase() {
  console.log('📡 Buscando correções do Supabase...');
  const url = `${SUPABASE_URL}/rest/v1/corrections?select=*&order=createdAt.desc`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  console.log(`   ${data.length} correções encontradas.\n`);
  return data;
}

// ─── Migrate ─────────────────────────────────────
async function migrate() {
  console.log('🚀 Iniciando migração Supabase → Firestore...\n');
  await authenticate();

  let corrections;
  try { corrections = await fetchSupabase(); } catch (err) {
    console.error('❌ Erro ao buscar Supabase:', err.message);
    process.exit(1);
  }
  if (corrections.length === 0) { console.log('✅ Nenhuma correção para migrar.'); return; }

  let imported = 0, errors = 0;

  for (const c of corrections) {
    try {
      const nome = c.studentName || 'Estudante';
      const turma = c.studentClass || 'N/A';
      const scoreData = Array.isArray(c.scoreData) ? c.scoreData : [];

      const primeiro = nome.split(' ')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const loginAluno = `${primeiro}_migrado`;

      const loginKey = await gerarLoginKey(loginAluno);

      await setDoc(doc(db, 'professores', userId, 'correcoes', loginKey), {
        id: loginKey,
        userId,
        studentName: nome,
        studentClass: turma,
        essayTheme: c.essayTheme || 'Geral',
        result: c.result || '',
        scoreData,
        totalScore: c.totalScore || 0,
        loginAluno,
        createdAt: serverTimestamp(),
        _supabaseId: c.id,
      });

      await vincularAluno(loginAluno, nome, turma);

      imported++;
      console.log(`   ✓ [${imported}/${corrections.length}] ${nome} — ${c.totalScore || 0}/1000 (Turma ${turma})`);
    } catch (err) {
      errors++;
      console.error(`   ✗ Erro "${c.studentName}": ${err.message}`);
    }
  }

  console.log(`\n✅ Concluído: ${imported} importadas, ${errors} erros.`);
  console.log(`   Firestore: professores/${userId}/correcoes/*`);
  console.log(`   alunoLogin: ${imported} vínculos criados.`);
}

migrate().catch(console.error);
