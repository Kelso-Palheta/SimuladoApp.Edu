const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cleanAllOrphans() {
  console.log('Iniciando limpeza global de vínculos órfãos...');
  const profsSnap = await db.collection('professores').get();
  
  let totalDeleted = 0;

  for (const prof of profsSnap.docs) {
    const profId = prof.id;
    console.log(`Verificando prof: ${profId}`);
    
    // Pegar turmas ativas
    const dataDoc = await db.collection('professores').doc(profId).collection('turmas').doc('data').get();
    let turmasAtivas = [];
    if (dataDoc.exists) {
      turmasAtivas = dataDoc.data().turmas || [];
    } else {
      const p = await prof.ref.get();
      if (p.exists) turmasAtivas = p.data().turmas || [];
    }

    const activeKeys = new Set();
    turmasAtivas.forEach(t => {
      if (t.alunos && Array.isArray(t.alunos)) {
        t.alunos.forEach(a => {
          activeKeys.add(`${t.id}_${a.id}`);
        });
      }
    });

    // Pegar vínculos desse prof
    const vinculosSnap = await db.collectionGroup('vinculos').where('professorUid', '==', profId).get();
    
    for (const vDoc of vinculosSnap.docs) {
      const data = vDoc.data();
      const key = `${data.turmaId}_${data.alunoId}`;
      
      if (!activeKeys.has(key)) {
        console.log(`  > Deletando vínculo órfão: Turma ${data.turmaId}, Aluno ${data.alunoId}, LoginDoc: ${vDoc.ref.parent.parent.id}`);
        await vDoc.ref.delete();
        totalDeleted++;
      }
    }
  }

  console.log(`Concluído! Total de vínculos órfãos deletados: ${totalDeleted}`);
}

cleanAllOrphans().then(() => process.exit(0)).catch(console.error);
