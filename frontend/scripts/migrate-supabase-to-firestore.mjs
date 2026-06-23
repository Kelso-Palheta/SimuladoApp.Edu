#!/usr/bin/env node

/**
 * Migração Supabase → Firestore (Redação Corrigida)
 *
 * Uso:
 *   1. Configure as variáveis de ambiente no .env.local:
 *      SUPABASE_URL=https://xxx.supabase.co
 *      SUPABASE_ANON_KEY=eyJ...
 *      NEXT_PUBLIC_FIREBASE_PROJECT_ID=simuladoapp-edu
 *
 *   2. Execute:
 *      node scripts/migrate-supabase-to-firestore.mjs <seu-user-id-firebase>
 *
 *   O script exporta todas as correções do Supabase e importa para:
 *     Firestore: professores/{userId}/correcoes/{id}
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { gerarLoginKey } from '../src/utils/diario/loginAluno.js';
import { vincularAlunoProfessor } from '../src/lib/firebase-aluno.js';

// ─── Config ──────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'simuladoapp-edu';

const userId = process.argv[2];
if (!userId) {
  console.error('❌ Informe o userId do Firebase como argumento.');
  console.error('   Ex: node scripts/migrate-supabase-to-firestore.mjs abc123xyz');
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Configure SUPABASE_URL e SUPABASE_ANON_KEY no .env.local');
  process.exit(1);
}

// ─── Firebase Init ───────────────────────────────
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'migration-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${FIREBASE_PROJECT_ID}.appspot.com`,
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// ─── Fetch Supabase ──────────────────────────────
async function fetchSupabase() {
  console.log('📡 Buscando correções do Supabase...');
  const url = `${SUPABASE_URL}/rest/v1/corrections?select=*&order=createdAt.desc`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Supabase error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  console.log(`   ${data.length} correções encontradas.`);
  return data;
}

// ─── Migrate ─────────────────────────────────────
async function migrate() {
  console.log('🚀 Iniciando migração...\n');

  let corrections;
  try {
    corrections = await fetchSupabase();
  } catch (err) {
    console.error('❌ Erro ao buscar Supabase:', err.message);
    process.exit(1);
  }

  if (corrections.length === 0) {
    console.log('✅ Nenhuma correção para migrar.');
    return;
  }

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const c of corrections) {
    try {
      // Usa o ID existente ou gera um novo
      const corrId = c.id?.toLowerCase() || `migrated_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

      // Tenta gerar loginAluno se tiver nome do aluno
      let loginAluno = null;
      let loginKey = null;
      if (c.studentName) {
        // Para dados migrados, não temos dataNascimento.
        // Usa o ID existente como login para não perder o acesso.
        loginAluno = corrId;
        loginKey = await gerarLoginKey(loginAluno);
      }

      // Mapeia scoreData do formato Supabase (jsonb) para Firestore
      const scoreData = Array.isArray(c.scoreData) ? c.scoreData : [];

      const docData = {
        id: corrId,
        userId,
        studentName: c.studentName || 'Estudante',
        studentClass: c.studentClass || 'N/A',
        essayTheme: c.essayTheme || 'Geral',
        result: c.result || '',
        scoreData,
        totalScore: c.totalScore || 0,
        loginAluno: loginAluno || corrId,
        createdAt: c.createdAt
          ? serverTimestamp()
          : serverTimestamp(),
        _supabaseId: c.id, // preserva referência original
      };

      // Salva no Firestore
      const ref = doc(db, 'professores', userId, 'correcoes', corrId);
      await setDoc(ref, docData);

      // Salva no alunoLogin com vínculo multi-professor
      if (loginKey) {
        await vincularAlunoProfessor({
          login: loginAluno,
          nome: c.studentName || 'Estudante',
          professorUid: userId,
          turmaId: c.studentClass || 'N/A',
          modulo: 'redacao',
          nomeProfessor: 'Professor (migrado)'
        });
      }

      imported++;
      console.log(`   ✓ [${imported}/${corrections.length}] ${c.studentName} — ${c.totalScore || 0}/1000`);
    } catch (err) {
      errors++;
      console.error(`   ✗ Erro em "${c.studentName}": ${err.message}`);
    }
  }

  console.log(`\n✅ Concluído: ${imported} importadas, ${errors} erros.`);
  console.log(`   Firestore: professores/${userId}/correcoes/*`);
}

migrate().catch(console.error);
