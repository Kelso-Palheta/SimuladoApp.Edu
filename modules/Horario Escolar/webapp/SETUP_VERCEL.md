# Setup Vercel + MongoDB

## 1. MongoDB Atlas (Banco Nuvem Gratuito)

1. Acesse https://www.mongodb.com/cloud/atlas
2. Clique "Register" (com Google é mais fácil)
3. Crie organização (nome qualquer)
4. Clique "Create a Deployment" → escolha M0 (gratuito)
5. Selecione região (AWS, recomendado: us-east-1 ou sa-east-1)
6. Aguarde criação (~2min)
7. Clique "Connect" → "Drivers" → copie connection string
   - Padrão: `mongodb+srv://username:password@cluster0.mongodb.net/...`
8. Copie para arquivo `.env.local` (local):
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/horario_escolar?retryWrites=true&w=majority
   ```

## 2. Deploy em Vercel

1. Acesse https://vercel.com (login com GitHub)
2. Clique "Import Project"
3. Cole URL repo: `https://github.com/Kelso-Palheta/horario-escolar`
4. Clique "Import"
5. Em "Environment Variables", adicione:
   - **Name:** `MONGODB_URI`
   - **Value:** Cole connection string do MongoDB
6. Clique "Deploy"
7. Aguarde ~1min
8. URL gerada: `https://horario-escolar-<random>.vercel.app`

## 3. Usar Sincronização no App

No app web, botão "Sincronizar" salvará na nuvem:
- Input: email + nome escola
- Clique "Salvar na Nuvem" → salva em MongoDB
- Clique "Carregar da Nuvem" → carrega de outro PC

## 4. Variáveis de Ambiente

- **Local (dev):** arquivo `.env.local` na raiz webapp/
- **Vercel (prod):** Settings → Environment Variables

---

**Nota:** Primeiro deploy pode levar 2-3min. Próximas são instantâneas.
