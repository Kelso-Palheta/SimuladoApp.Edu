# Relatório Técnico de Depuração e Arquitetura de Sincronização (Diário Pedagógico)

Este documento descreve as condições de corrida, bugs de persistência e a arquitetura de controle de versão implementada no **SimuladoApp.Edu** para orientar outros agentes de IA (como DeepSeek) ou desenvolvedores na depuração do estado global do Diário.

---

## 1. O Sintoma do Problema
O professor editava informações no Diário (como excluir uma turma ou preencher a data de nascimento de um aluno para liberar o login). O sistema aparentava salvar, mas ao recarregar a página ou navegar para outros módulos (como **Atividades** ou **Redação**) e retornar, **as alterações sumiam** e os dados antigos reapareciam.

---

## 2. A Causa Raiz do Bug (Duas Falhas de Sincronização)

### Falha A: Filtro Incompleto de Sincronização no Hook `useTurmas.js`
No arquivo `frontend/src/hooks/diario/useTurmas.js`, o `useEffect` encarregado de observar a fonte de verdade (`initialTurmas` vinda do Firestore/localStorage) e atualizar o estado interno (`turmas`) possuía um algoritmo de mesclagem falho:

```javascript
// CÓDIGO ANTIGO (COM BUG):
useEffect(() => {
  if (initialTurmas && initialTurmas.length > 0) {
    setTurmasState((prev) => {
      if (prev.length === 0) return initialTurmas;
      // Procura apenas por turmas novas (adição):
      const prevIds = new Set(prev.map(t => t.id));
      const novas = initialTurmas.filter(t => !prevIds.has(t.id));
      if (novas.length > 0) return [...prev, ...novas];
      return prev; // Se uma turma foi excluída da cloud/initialTurmas, ela é ignorada aqui!
    });
  }
}, [initialTurmas]);
```

*   **O Bug:** Esse algoritmo só sabia **adicionar** turmas que existiam em `initialTurmas` mas não em `prev`. Se uma turma existisse em `prev` mas tivesse sido **deletada** em `initialTurmas` (exclusão), a exclusão era completamente ignorada, mantendo a lista de turmas defasada na memória local do hook.
*   **Consequência:** Qualquer posterior modificação ou salvamento automático reenviava a turma velha (ressuscitada) de volta para o Firestore.

---

### Falha B: Condição de Corrida (Race Condition) na página de Redação
As páginas **Diário** (`diario/page.js`) e **Atividades** (`atividades/page.js`) foram anteriormente corrigidas com um sistema de controle de versão por carimbo de data/hora (`lastUpdated` timestamp). A página de **Redação** (`redacao/page.js`), contudo, foi deixada com o carregamento legado:

```javascript
// CÓDIGO ANTIGO (COM BUG EM redacao/page.js):
if (snap.exists() && snap.data().turmas?.length > 0) {
  const cloud = snap.data().turmas;
  setInitialTurmas(cloud);
  salvarLocal(cloud); // Sobrescrevia incondicionalmente o localStorage com a versão do Firestore!
}
```

*   **O Bug:** O Firestore leva entre 100~200ms para concluir uma gravação. Se o professor editava uma data de nascimento ou excluía uma turma no Diário e **imediatamente navegava para a aba de Redação**, a página de Redação montava e disparava a consulta ao Firestore.
*   Como a gravação do Diário ainda estava em andamento no banco de dados, a página de Redação recebia os **dados antigos** do Firestore e sobrescrevia imediatamente o `localStorage` local com essa lista desatualizada.
*   Ao retornar para o Diário, o sistema inicializava do `localStorage` corrompido (desatualizado) e salvava o estado antigo de volta no Firestore, destruindo as edições de data de nascimento ou recriando turmas apagadas.

---

## 3. As Soluções Implementadas

### Solução A: Sincronização Direta no Hook `useTurmas.js`
Substituição da lógica de mesclagem incompleta por uma atribuição direta no arquivo `frontend/src/hooks/diario/useTurmas.js`:

```javascript
// CÓDIGO CORRIGIDO (useTurmas.js):
useEffect(() => {
  if (initialTurmas) {
    setTurmasState(initialTurmas);
  }
}, [initialTurmas]);
```
*   **Resultado:** Garante que qualquer alteração de exclusão de turmas ou edição de dados internos de alunos seja adotada pelo estado interno do hook sem rejeições.

---

### Solução B: Padronização do Controle de Versão por Timestamps
Unificação da lógica de carregamento baseada no timestamp `lastUpdated` em todas as três páginas de controle do professor (**Diário**, **Atividades** e **Redação**):

```javascript
// CÓDIGO CORRIGIDO (Implementado em diario/page.js, atividades/page.js e redacao/page.js):
const ref = doc(db, 'professores', user.uid, 'turmas', 'data');
const snap = await getDoc(ref);

if (snap.exists() && snap.data().turmas?.length > 0) {
  const cloud = snap.data().turmas;
  const cloudTime = snap.data().lastUpdated || 0;
  const localTime = typeof window !== 'undefined' ? Number(localStorage.getItem(STORAGE_KEY + '_lastUpdated')) || 0 : 0;

  if (cloudTime >= localTime || !local) {
    setInitialTurmas(cloud);
    salvarLocal(cloud, cloudTime);
  } else {
    // Se o dado local for mais recente (porque a gravação anterior ainda está propagando),
    // usa a versão local e sincroniza para a Cloud de forma ativa:
    setInitialTurmas(local);
    await setDoc(ref, { turmas: local, lastUpdated: localTime }, { merge: true });
  }
}
```

*   **Resultado:** Previne condições de corrida ao navegar rapidamente entre abas. Se o Firestore ainda não refletir a última modificação, a página de destino detecta que o seu `localStorage` é mais atual e força a sincronização da versão mais recente, eliminando a sobregravação por dados obsoletos.

---

## 4. O Porquê de os Logins de Alunos Funcionarem Mesmo com a Data Sumindo
A sincronização do login do aluno no Firestore escreve em `alunoLogin/{loginKey}` e `notasAluno/{recordId}` de forma direta. Uma vez criado o login na nuvem, ele **nunca é deletado** pelo aplicativo (as exclusões e correções só afetam a lista do diário do professor). 

Portanto, a aluna conseguia logar normalmente porque o seu documento de autenticação individual já havia sido gravado com sucesso no Firestore na primeira tentativa, muito embora o carimbo de data de nascimento tenha sumido da ficha do professor no diário em virtude da sobregravação descrita no item 2.
