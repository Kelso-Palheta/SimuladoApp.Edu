import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve('/Users/kelsopalheta/Developer/SimuladoApp.Edu/frontend/.env.local');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length && !key.startsWith('#')) process.env[key.trim()] = rest.join('=').trim();
  });
}

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

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

// Mapeamento
const MAP = {
  'f1de3b5b-0c17-457f-8bdf-a2555ad577b9': 'EuhpKefCYVaV1hKPX2qJfx7MAuy1',
  '6e8f85d6-5c4e-40e0-869c-2ab1ccedb8dd': '6CSGiRCRFtVISere0Ht1iG18QAv1',
  '21d7ebb3-f267-4595-8b83-d158be686ca5': 'QQpYHBHK6hR3kvHoFHKeacjYR7u2',
  '4437b3d6-1418-488b-b603-759aea700683': '1eEbllgldgTY8Zs0wrz4HJTkt6R2',
  'a00e3849-08a5-40dc-9a42-f03cf5ab365a': 'gcPpCO3zN3aex7l7NkSnrZuOsuo2',
};
const DEFAULT_UID = '1eEbllgldgTY8Zs0wrz4HJTkt6R2';

async function gerarLoginKey(login) {
  const e = new TextEncoder().encode(login);
  const h = await crypto.subtle.digest('SHA-256', e);
  return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2,'0')).join('');
}

async function main() {
  // Auth as Kelso
  console.log('Autenticando...');
  const auth = getAuth(app);
  try { await signInWithEmailAndPassword(auth, 'kelsopalhetadev@gmail.com', process.argv[2] || ''); } catch(e) {}

  // Fetch Supabase
  console.log('Buscando Supabase...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/corrections?select=*`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  const corrections = await res.json();
  console.log(`${corrections.length} correções`);

  let done = 0;
  for (const c of corrections) {
    const oldUid = c.userId;
    const targetUid = MAP[oldUid] || DEFAULT_UID;
    const nome = c.studentName || 'Estudante';
    const primeiro = nome.split(' ')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
    const loginAluno = `${primeiro}_migrado`;
    const loginKey = await gerarLoginKey(loginAluno);
    const scoreItems = (c.scoreData || []).map(s => ({
      subject: s.subject || 'C1', A: Number(s.A) || 0, fullMark: Number(s.fullMark) || 200
    }));

    await setDoc(doc(db, 'professores', targetUid, 'correcoes', loginKey), {
      id: loginKey, userId: targetUid, studentName: nome,
      studentClass: c.studentClass || 'N/A', essayTheme: c.essayTheme || 'Geral',
      result: c.result || '', scoreData: scoreItems, totalScore: Number(c.totalScore) || 0,
      loginAluno, _supabaseId: c.id, createdAt: serverTimestamp()
    });

    await setDoc(doc(db, 'alunoLogin', loginKey), { nome, login: loginAluno }, { merge: true });
    await setDoc(doc(db, 'alunoLogin', loginKey, 'vinculos', targetUid), {
      professorUid: targetUid, turmaId: c.studentClass || 'N/A',
      modulo: 'redacao', nomeProfessor: 'Professor'
    }, { merge: true });

    done++;
    if (done % 50 === 0) console.log(`   ${done}/${corrections.length}`);
  }
  console.log(`\n✅ ${done} correções salvas via SDK`);
}
main().catch(console.error);
