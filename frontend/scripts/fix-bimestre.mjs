import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDocs, collection, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync, existsSync } from 'fs';

const envPath = '/Users/kelsopalheta/Developer/SimuladoApp.Edu/frontend/.env.local';
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length && !key.startsWith('#')) process.env[key.trim()] = rest.join('=').trim();
  });
}

const app = !getApps().length ? initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}) : getApps()[0];

const db = getFirestore(app);
const TARGET_UID = '6CSGiRCRFtVISere0Ht1iG18QAv1';

async function main() {
  const auth = getAuth(app);
  try { await signInWithEmailAndPassword(auth, 'kelsopalhetadev@gmail.com', process.argv[2] || ''); } catch(e) {}
  
  const snap = await getDocs(collection(db, 'professores', TARGET_UID, 'correcoes'));
  let count = 0;
  for (const d of snap.docs) {
    const data = d.data();
    if (!data.bimestre || data.bimestre === 1) {
      await setDoc(doc(db, 'professores', TARGET_UID, 'correcoes', d.id), { bimestre: 2 }, { merge: true });
      count++;
      console.log(`  ✓ ${data.studentName} → bimestre 2`);
    }
  }
  console.log(`\n${count} correções atualizadas.`);
}
main().catch(console.error);
