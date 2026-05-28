const fs = require('fs');
const ENV_PATH = require('path').join(process.cwd(), '.env');
const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
});

async function test() {
    console.log("Inserindo com userId vazia...");
    let res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/corrections`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            id: Math.random().toString(36).substring(2, 5).toUpperCase() + '-TEST',
            studentName: "Teste Sincronizacao",
            studentClass: "301",
            essayTheme: "Tema Teste",
            result: "Teste",
            scoreData: [],
            totalScore: 100
        })
    });
    console.log("Status 1:", res.status);
    console.log("Response 1:", await res.text());

    console.log("\nInserindo com userId inexistente (ForeignKey violation)...");
    res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/corrections`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            id: Math.random().toString(36).substring(2, 5).toUpperCase() + '-TEST2',
            userId: "11111111-1111-1111-1111-111111111111", // ID que não existe
            studentName: "Teste Falha",
            studentClass: "301",
            essayTheme: "Tema Teste",
            result: "Teste",
            scoreData: [],
            totalScore: 100
        })
    });
    console.log("Status 2:", res.status);
    console.log("Response 2:", await res.text());
}
test();
