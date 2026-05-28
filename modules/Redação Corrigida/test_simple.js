const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: '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' });
openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'oi' }] })
.then(r => console.log('✅ OK:', r.choices[0].message.content))
.catch(e => console.log('❌ ERRO:', e.message));
