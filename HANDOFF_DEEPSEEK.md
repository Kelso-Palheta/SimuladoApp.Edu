# HANDOFF — Portal do Aluno (SimuladoApp.Edu)

## Contexto
Projeto Next.js em `/Users/kelsopalheta/Developer/SimuladoApp.Edu/frontend`.
Estamos migrando o "Dashboard - Gestão de Notas" (React+Vite, em `/Users/kelsopalheta/Developer/Dashboard - Gestão de Notas`) para um novo Hub unificado em Next.js App Router.

O módulo de Professor (Gerador de Atividades) já foi migrado e está funcional.  
**O que falta: o Portal do Aluno** — rotas públicas onde o aluno faz login, vê notas e responde atividades.

---

## O que já existe no novo projeto

### Estrutura relevante já criada:
```
frontend/src/
  lib/
    firebase.js              ← config Firebase (db, auth)
    firebase-aluno.js        ← funções Firestore do lado aluno
    firebase-atividades.js   ← funções Firestore do lado professor
  utils/
    diario/
      loginAluno.js          ← gerarLoginAluno(), gerarLoginKey()
      tokenUtils.js          ← encodeToken(), decodeToken()
    atividades/
      correcaoIA.js
      pdfExtractor.js
      textUtils.js
      storageUtils.js
  hooks/
    atividades/
      useAtividades.js
      useEntregas.js
  components/
    atividades/
      AtividadeForm.jsx
      AtividadePainel.jsx
      TodasAtividades.jsx
      EntregaDrawer.jsx
      UrlCopyPanel.jsx
    ui/
      RichTextEditor.jsx
  app/
    page.js                  ← Hub/Login professor
    diario/page.js           ← Diário pedagógico
    atividades/page.js       ← Módulo atividades professor
```

### lib/firebase-aluno.js — funções já implementadas:
- `validarLoginAluno(login)` → busca em `alunoLogin/{hash}` retorna `{alunoId, turmaId, professorUid, nome, login}`
- `getAtividadePublica(activityId)` → lê atividade sem gabarito (remove campo `gabarito` e `rubrica` das questões)
- `getEntrega(activityId, alunoId)` → lê entrega em `entregas/{activityId}_{alunoId}`
- `submitEntrega({activityId, alunoId, turmaId, bimestre, respostas?, respostaTexto?})` → cria/atualiza entrega
- `getNotasAluno(recordId)` → lê em `notasAluno/{professorUid}_{turmaId}_{alunoId}`
- `getAtividadesDoAluno(professorUid, turmaId)` → lista atividades da turma
- `getEntregasDoAluno(alunoId)` → lista entregas do aluno
- `getTokenAluno(activityId, alunoId)` → token da subcoleção `atividades/{id}/tokens/{alunoId}`

### utils/diario/tokenUtils.js:
```js
export const decodeToken = (token) => {
  try {
    const decoded = decodeURIComponent(escape(atob(token)));
    const [alunoId, activityId] = decoded.split(':');
    if (!alunoId || !activityId) return null;
    return { alunoId, activityId };
  } catch { return null; }
};
```

### utils/diario/calculos.js — funções já existentes no legado:
Copiar de `/Users/kelsopalheta/Developer/Dashboard - Gestão de Notas/src/utils/calculos.js`
Para: `frontend/src/utils/diario/calculos.js`  
(funções: `calcTotal`, `calcSemestre`, `fmt`, `temNota`)

---

## TAREFAS A EXECUTAR

### 1. Copiar calculos.js
```bash
cp "/Users/kelsopalheta/Developer/Dashboard - Gestão de Notas/src/utils/calculos.js" \
   "/Users/kelsopalheta/Developer/SimuladoApp.Edu/frontend/src/utils/diario/calculos.js"
```

---

### 2. Instalar dependência dompurify
```bash
cd /Users/kelsopalheta/Developer/SimuladoApp.Edu/frontend
npm install dompurify
```

---

### 3. Criar `src/app/aluno/page.js` — Login do aluno

```jsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validarLoginAluno } from '@/lib/firebase-aluno';

export default function AlunoLoginPage() {
  const [login, setLogin] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valor = login.trim().toLowerCase();
    if (!valor) return;

    setErro('');
    setLoading(true);

    try {
      const dados = await validarLoginAluno(valor);
      if (!dados) {
        setErro('Login não encontrado. Verifique seu nome e data de nascimento.');
        setLoading(false);
        return;
      }

      // Salva sessão no sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('aluno_login', JSON.stringify({
          login: valor,
          nome: dados.nome,
          alunoId: dados.alunoId,
          turmaId: dados.turmaId,
          professorUid: dados.professorUid
        }));
      }

      router.push('/aluno/notas');
    } catch (err) {
      console.error('Erro ao validar login:', err);
      setErro('Erro ao validar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-card-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-tr from-violet-700 to-violet-400 flex items-center justify-center text-white text-sm font-extrabold shadow-glow">
            N
          </div>
          <h1 className="text-lg font-bold text-ink-950">Consulta de Notas</h1>
          <p className="text-sm text-slate-400 mt-1">
            Digite seu login para acessar suas notas.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-ink-950 mb-1.5">
              Login
            </label>
            <input
              type="text"
              value={login}
              onChange={(e) => { setLogin(e.target.value); setErro(''); }}
              placeholder="Ex: kelso0407"
              className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-sm text-ink-950 placeholder-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-violet-400/50 transition-all duration-300"
              autoFocus
              disabled={loading}
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Seu primeiro nome + dia e mês de nascimento.<br />
              Exemplo: KELSO PALHETA nascido em 07/04 → <strong>kelso0407</strong>
            </p>
          </div>

          {erro && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-xs text-red-500">{erro}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!login.trim() || loading}
            className="w-full py-3 bg-violet-500 hover:bg-violet-400 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-xl text-white text-sm font-semibold transition-all btn-3d-primary"
          >
            {loading ? 'Verificando...' : 'Acessar Notas'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

### 4. Criar `src/app/aluno/notas/page.js` — Painel de Notas

Adaptar de `/Users/kelsopalheta/Developer/Dashboard - Gestão de Notas/src/components/aluno/AlunoNotasPainel.jsx`

**Mudanças necessárias:**
- Remover `useNavigate` → usar `useRouter` do next/navigation
- Substituir `navigate('/aluno')` → `router.push('/aluno')`
- Substituir `navigate('/aluno/notas')` → `router.push('/aluno/notas')`
- Substituir `<a href={...}>` para link de atividade: usar o path `/aluno/atividade/${atividade.id}?token=${token}` (mantém como `<a href>` comum, não next/link, para abrir a URL corretamente com o token)
- Substituir imports:
  - `from '../../firebase/firestore-aluno'` → `from '@/lib/firebase-aluno'`
  - `from '../../utils/calculos'` → `from '@/utils/diario/calculos'`
- Adicionar `"use client";` no topo

---

### 5. Criar `src/app/aluno/atividade/[id]/page.js` — Resolução da Atividade

Adaptar de `/Users/kelsopalheta/Developer/Dashboard - Gestão de Notas/src/components/aluno/AtividadePageAluno.jsx`

**Mudanças necessárias:**
- Remover `useParams` e `useSearchParams` do react-router-dom
- Usar `useParams` do next/navigation para obter `{id}` (que é o activityId)
- Usar `useSearchParams` do next/navigation para obter o token
- Substituir `<Link to={...}>` → `<a href={...}>` ou usar `import Link from 'next/link'` com `href`
- Substituir imports:
  - `from '../../utils/tokenUtils'` → `from '@/utils/diario/tokenUtils'`
  - `from '../../firebase/firestore-aluno'` → `from '@/lib/firebase-aluno'`
  - `from '../../firebase/firestore-atividades'` → `from '@/lib/firebase-atividades'`
  - `from './RespostaForm'` → criar o arquivo junto (ver abaixo)
  - `from './ConfirmacaoView'` → criar o arquivo junto
  - `from './FeedbackView'` → criar o arquivo junto
  - `from './ErroView'` → criar o arquivo junto
- Adicionar `"use client";` no topo
- O `useSearchParams` no Next.js precisa de Suspense wrapper — envolver em Suspense ou usar um componente interno

**Estrutura da página:**
```
src/app/aluno/atividade/[id]/
  page.js                 ← página principal (com Suspense)
  AtividadeContent.jsx    ← componente interno com useSearchParams
  RespostaForm.jsx        ← copiar/adaptar do legado (remover DOMPurify import se necessário, ou instalar)
  ConfirmacaoView.jsx     ← copiar/adaptar do legado (trocar Link do react-router por next/link ou <a>)
  FeedbackView.jsx        ← copiar do legado (sem mudanças, apenas "use client")
  ErroView.jsx            ← copiar do legado (sem mudanças, apenas "use client")
```

**Conteúdo dos arquivos legado a copiar:**
- RespostaForm: `/Users/kelsopalheta/Developer/Dashboard - Gestão de Notas/src/components/aluno/RespostaForm.jsx`
- ConfirmacaoView: `/Users/kelsopalheta/Developer/Dashboard - Gestão de Notas/src/components/aluno/ConfirmacaoView.jsx`
- FeedbackView: `/Users/kelsopalheta/Developer/Dashboard - Gestão de Notas/src/components/aluno/FeedbackView.jsx`
- ErroView: `/Users/kelsopalheta/Developer/Dashboard - Gestão de Notas/src/components/aluno/ErroView.jsx`

**Estrutura do page.js (com Suspense):**
```jsx
"use client";
import { Suspense } from 'react';
import AtividadeContent from './AtividadeContent';

export default function AtividadeAlunoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-700 to-violet-400 animate-pulse" />
      </div>
    }>
      <AtividadeContent />
    </Suspense>
  );
}
```

**AtividadeContent.jsx** — é a AtividadePageAluno adaptada:
- `const { id: activityId } = useParams();`
- `const searchParams = useSearchParams(); const token = searchParams.get('token');`
- Link de "Voltar": `<a href={typeof window !== 'undefined' && sessionStorage.getItem('aluno_login') ? '/aluno/notas' : '/aluno'}>Voltar</a>`

---

### 6. Verificar se `ErroView.jsx` do legado usa Link do react-router

Arquivo legado: `/Users/kelsopalheta/Developer/Dashboard - Gestão de Notas/src/components/aluno/ErroView.jsx`

Se usar `<Link to={...}>` do react-router, trocar por `<a href={...}>`.

---

### 7. Verificar se `dompurify` precisa ser usado com `typeof window !== 'undefined'`

No Next.js com SSR, DOMPurify só funciona no cliente. No RespostaForm e FeedbackView, garantir:
```js
import DOMPurify from 'dompurify';
// ... e no uso:
{ __html: typeof window !== 'undefined' ? DOMPurify.sanitize(texto.html) : texto.html }
```

---

### 8. Atualizar `src/app/aluno/notas/page.js` — link de atividade

No `AlunoNotasPainel` legado, o link de atividade usa:
```jsx
<a href={`/atividade/${atividade.id}?token=${token}`}>
```
No novo projeto, o path correto é:
```jsx
<a href={`/aluno/atividade/${atividade.id}?token=${token}`}>
```

---

## Resumo dos arquivos a criar/copiar

| Arquivo novo | Origem |
|---|---|
| `src/utils/diario/calculos.js` | copiar de legado |
| `src/app/aluno/page.js` | novo (ver acima) |
| `src/app/aluno/notas/page.js` | adaptar AlunoNotasPainel.jsx |
| `src/app/aluno/atividade/[id]/page.js` | novo (Suspense wrapper) |
| `src/app/aluno/atividade/[id]/AtividadeContent.jsx` | adaptar AtividadePageAluno.jsx |
| `src/app/aluno/atividade/[id]/RespostaForm.jsx` | adaptar RespostaForm.jsx |
| `src/app/aluno/atividade/[id]/ConfirmacaoView.jsx` | adaptar ConfirmacaoView.jsx |
| `src/app/aluno/atividade/[id]/FeedbackView.jsx` | adaptar FeedbackView.jsx |
| `src/app/aluno/atividade/[id]/ErroView.jsx` | adaptar ErroView.jsx |

---

## Regras de estilo / convenções do projeto

- Todos os componentes client-side: `"use client";` no topo
- Imports com alias: `@/lib/...`, `@/utils/...`, `@/components/...`, `@/hooks/...`
- Classes CSS do projeto (já definidas no globals.css):
  - `bg-ink-700`, `bg-ink-600`, `border-ink-600` → fundo cinza claro, borda
  - `text-ink-950` → texto escuro
  - `animate-card-in` → fade-in suave
  - `btn-3d-primary` → botão com efeito 3D
  - `shadow-glow` → sombra violeta
- Firebase está em `@/lib/firebase` exportando `db`

---

## Como testar após implementar

```bash
cd /Users/kelsopalheta/Developer/SimuladoApp.Edu/frontend
npm run dev
```

Acessar:
- `http://localhost:3000/aluno` → tela de login do aluno
- `http://localhost:3000/aluno/notas` → painel de notas (requer sessionStorage)
- `http://localhost:3000/aluno/atividade/[id]?token=[token]` → resolução da atividade
