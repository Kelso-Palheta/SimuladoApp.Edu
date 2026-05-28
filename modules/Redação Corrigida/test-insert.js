const fs = require('fs');
const ENV_PATH = require('path').join(process.cwd(), '.env');
const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
});

async function test() {
    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/corrections`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            id: "TEST-123",
            studentName: "Teste",
            studentClass: "301",
            essayTheme: "Tema Teste",
            result: "Teste",
            scoreData: [],
            totalScore: 100
        })
    });
    console.log("Status:", res.status);
    console.log("Response:", await res.text());
}
test();
