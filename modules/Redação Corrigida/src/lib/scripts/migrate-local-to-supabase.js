const fs = require('fs');
const path = require('path');

// Configurações
const USERS_PATH = path.join(process.cwd(), 'src/lib/data/users.json');
const CORRECTIONS_PATH = path.join(process.cwd(), 'src/lib/data/corrections.json');
const ENV_PATH = path.join(process.cwd(), '.env');

// Função simples para carregar o .env manualmente já que o dotenv pode não estar instalado
function loadEnv() {
  if (fs.existsSync(ENV_PATH)) {
    const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ ERRO: SUPABASE_URL ou SUPABASE_ANON_KEY não encontradas no .env');
  console.log('Por favor, adicione-as ao seu arquivo .env local antes de rodar este script.');
  process.exit(1);
}

async function migrate() {
  console.log('🚀 Iniciando migração para o Supabase...');

  // 1. Migrar Usuários
  if (fs.existsSync(USERS_PATH)) {
    const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    console.log(`👥 Migrando ${users.length} usuários...`);
    
    for (const user of users) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'resolution=merge-duplicates' // Upsert simples
          },
          body: JSON.stringify(user)
        });
        if (res.ok) console.log(`   ✅ Usuário ${user.email} migrado.`);
        else console.error(`   ❌ Erro ao migrar ${user.email}: ${res.statusText}`);
      } catch (err) {
        console.error(`   💥 Falha na requisição para ${user.email}:`, err.message);
      }
    }
  }

  // 2. Migrar Correções
  if (fs.existsSync(CORRECTIONS_PATH)) {
    const corrections = JSON.parse(fs.readFileSync(CORRECTIONS_PATH, 'utf-8'));
    console.log(`📝 Migrando ${corrections.length} correções...`);
    
    for (const correction of corrections) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/corrections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(correction)
        });
        if (res.ok) console.log(`   ✅ Correção ${correction.id} migrada.`);
        else console.error(`   ❌ Erro ao migrar ${correction.id}: ${res.statusText}`);
      } catch (err) {
        console.error(`   💥 Falha na requisição para ${correction.id}:`, err.message);
      }
    }
  }

  console.log('\n✨ Migração finalizada! Verifique seu dashboard no Supabase.');
}

migrate();
