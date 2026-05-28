# ⚡ Próximos Passos — Plano de Ação Sequencial

## 📋 Resumo do Que Foi Feito

Melhoramos o parser de PDF com:
- ✅ Detecção mais flexível de classes (strict + lenient)
- ✅ Tolerância adaptativa de colunas (±20px → ±50px)
- ✅ Processamento página-por-página
- ✅ Logging diagnóstico detalhado
- ✅ Ferramenta de diagnóstico interativa (`diagnostic-pdf.html`)

## 🎬 Plano de Teste — Faça UMA COISA POR VEZ

### PASSO 1️⃣: Usar a Ferramenta de Diagnóstico (5 min)

**Objetivo:** Entender a estrutura do seu PDF

**Ações:**
```
1. Abra no navegador: http://localhost:8000/diagnostic-pdf.html
2. Clique "Escolher arquivo" e selecione seu PDF
3. Clique "Analisar PDF"
4. Aguarde análise completar
```

**Procure por:**
- ✅ **Quantos items foram extraídos?** (deve ser > 50 em um PDF com tabela)
- ✅ **Possíveis Linhas de Cabeçalho:** (deve listar Y= com classes)
- ✅ **Classes encontradas (Strict):** (deve mostrar suas classes: 1º ANO - 101, etc)
- ✅ **Dias encontrados:** (segunda, terça, etc)
- ✅ **Horários encontrados:** (AULA 1, AULA 2, etc)

**Se ver problemas:** Compartilhe screenshot da seção "Estatísticas Gerais" comigo.

---

### PASSO 2️⃣: Testar o Importador (5 min)

**Objetivo:** Verificar se o parser agora funciona

**Ações:**
```
1. Abra no navegador: http://localhost:8000/importer.html
2. Clique "Escolher arquivo" e selecione o MESMO PDF
3. Clique "Carregar PDF"
4. Aguarde processamento
```

**Possíveis resultados:**

#### ✅ SUCESSO (tabela com dados aparece)
```
🎉 Se vir a tabela com linhas:
  Turma | Dia | Horário | Disciplina | Professor | Sala
  ───────────────────────────────────────────────────────
  1º ANO - 101 | segunda | 1 | Português | João Silva | Sala 1
  ...
```
→ **Vá para PASSO 3**

#### ❌ FALHA (ainda mostra 0 linhas)
```
❌ Erro: Nenhuma tabela detectada no PDF...
```
→ **Volte ao PASSO 1** e compartilhe:
- Screenshot do "Estatísticas Gerais"
- Screenshot do "Possíveis Linhas de Cabeçalho"
- Um exemplo do "Todos os Items Extraídos"

---

### PASSO 3️⃣: Debug via Console (2 min)

**Objetivo:** Ver logs detalhados de execução (se tiver problema)

**Ações:**
```
1. Abra http://localhost:8000/importer.html
2. Pressione F12 → aba "Console"
3. Carregue o PDF
4. Procure por logs que começam com [PDFParser]
```

**Exemplo de logs esperados:**
```
[PDFParser] Processing 5 pages (tabular mode)...
[PDFParser] Extracted 342 text items
[PDFParser] Y-coordinate range: 50 to 800
[PDFParser] X-coordinate range: 75 to 750
[PDFParser] Processing page 1 with 68 items...
[PDFParser] Y-grouping analysis:
  Total Y-groups: 18
[PDFParser] Searching for class headers in 18 Y-groups...
[PDFParser] Y=728: Found 4 class matches (strict): 1º ANO - 101, 1º ANO - 102, ...
[PDFParser] Class header row found at Y=728 (strict match):
  [{turma: '1º ANO - 101', x: 95}, ...]
```

**Se não vir `[PDFParser]`:** 
→ Pode significar que o código novo não está carregando. Tente:
```
1. Pressione Ctrl+Shift+R (hard reload)
2. Ou limpe cache do navegador
3. Recarregue a página
```

---

## 🎯 Checklist de Teste

- [ ] Ferramenta de diagnóstico carrega e mostra estatísticas
- [ ] PDF análise completa mostra estrutura (items, Y-groups)
- [ ] Classes são detectadas na seção "Possíveis Linhas de Cabeçalho"
- [ ] Importer.html não mostra erro ao carregar PDF
- [ ] Tabela com dados aparece em RF-02
- [ ] Validação em RF-03/04/05 funciona

---

## 📞 Se Tiver Dúvidas

**Compartilhe comigo:**
1. Screenshot do diagnóstico (estatísticas + cabeçalhos + items)
2. Screenshot do erro no importer (se tiver)
3. Console logs (F12)

**Com essas informações consigo ajustar o parser para seu PDF específico.**

---

## 📊 Timeframe Esperado

| Tarefa | Tempo | Status |
|--------|-------|--------|
| Passo 1 (Diagnóstico) | 5 min | ⏳ A fazer |
| Passo 2 (Importador) | 5 min | ⏳ A fazer |
| Passo 3 (Console) | 2 min | ⏳ A fazer |
| **TOTAL** | **~12 min** | ⏳ A fazer |

---

**Quando terminar os 3 passos, volte aqui com os resultados!** 📸
