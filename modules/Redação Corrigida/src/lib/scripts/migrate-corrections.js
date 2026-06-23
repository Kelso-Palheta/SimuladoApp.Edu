const fs = require('fs');
const path = require('path');

const CORRECTIONS_PATH = path.join(process.cwd(), 'src/lib/data/corrections.json');
const USERS_PATH = path.join(process.cwd(), 'src/lib/data/users.json');

async function migrate() {
  try {
    // 1. Ler o usuário padrão (o primeiro encontrado)
    if (!fs.existsSync(USERS_PATH)) {
      console.error('Arquivo de usuários não encontrado.');
      return;
    }
    const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    if (users.length === 0) {
      console.error('Nenhum usuário encontrado para atribuir correções.');
      return;
    }
    const defaultUserId = users[0].id;
    console.log(`Atribuindo correções ao usuário: ${users[0].name} (${defaultUserId})`);

    // 2. Ler correções
    if (!fs.existsSync(CORRECTIONS_PATH)) {
      console.error('Arquivo de correções não encontrado.');
      return;
    }
    const corrections = JSON.parse(fs.readFileSync(CORRECTIONS_PATH, 'utf-8'));
    
    let updatedCount = 0;
    const migratedCorrections = corrections.map(c => {
      if (!c.userId) {
        updatedCount++;
        return { ...c, userId: defaultUserId };
      }
      return c;
    });

    // 3. Salvar de volta
    fs.writeFileSync(CORRECTIONS_PATH, JSON.stringify(migratedCorrections, null, 2));
    console.log(`Sucesso! ${updatedCount} correções foram atualizadas.`);
    
  } catch (error) {
    console.error('Erro durante a migração:', error);
  }
}

migrate();
