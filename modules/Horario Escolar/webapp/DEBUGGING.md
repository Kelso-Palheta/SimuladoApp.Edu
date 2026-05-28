# 🔧 Guia de Debugging do Parser PDF

## Se o parser está retornando 0 linhas...

### 1️⃣ Usar a Ferramenta de Diagnóstico

**Abra:** `diagnostic-pdf.html` no navegador (http://localhost:8000/diagnostic-pdf.html)

Esta ferramenta vai mostrar:
- **Estatísticas gerais**: Quantos items foram extraídos, quantas linhas (Y-groups), etc.
- **Análise de Y-grouping**: Como os items foram agrupados por posição vertical
- **Possíveis linhas de cabeçalho**: Onde estão as classes detectadas
- **Padrões encontrados**: Quais dias, horários e classes foram encontradas
- **Tabela completa**: Todos os items extraídos com coordenadas

### 2️⃣ Interpretar os Resultados

#### ✅ Se você vê "Possíveis Linhas de Cabeçalho" com classes:
- O PDF tem estrutura tabular clara
- O parser deveria funcionar
- Tente recarregar `importer.html` e faça upload novamente

#### ❌ Se "Possíveis Linhas de Cabeçalho" está vazio:
O PDF não tem um formato que o parser espera. Possíveis causas:

1. **Classes em formato diferente**: Ex. "1A", "2B" em vez de "1º ANO - 101"
   - Solução: Melhorar o regex de detecção de classes

2. **Items muito espalhados**: Classes em coordenadas X muito diferentes
   - Solução: Aumentar tolerância de coluna (já feito: ±50px)

3. **Estrutura não-tabular**: PDF tem disposição diferente
   - Solução: Precisaremos reescrever o parser

### 3️⃣ Informações Técnicas do Diagnostic

A ferramenta mostra para cada item extraído:
- **Y**: Posição vertical (items com Y similar = mesma linha)
- **X**: Posição horizontal (items com X similar = mesma coluna)
- **Pág**: Número da página
- **Texto**: O texto extraído
- **Tipo**: Classificação (🎓 Class, 📅 Day, ⏰ Time, ou -)

## 🔍 Se ainda não funcionar...

### Checklist:
- [ ] O PDF contém uma tabela com horários?
- [ ] Cada "classe" tem um código (ex: 1º ANO - 101)?
- [ ] Os dias da semana aparecem no PDF?
- [ ] Os horários (AULA 1, AULA 2, etc) aparecem?

### Debug Avançado (Console):
1. Abra `importer.html`
2. Pressione `F12` → Console
3. Carregue um PDF
4. Procure por logs `[PDFParser]` que mostram:
   - Quantos items foram extraídos
   - Quantos Y-groups foram criados
   - Se a linha de cabeçalho foi encontrada
   - Se items foram agrupados em colunas

## 📝 Próximos Passos

Se o diagnostic mostra um padrão diferente do esperado:

1. Copie alguns exemplos de items do diagnostic
2. Compartilhe a saída
3. Podemos ajustar o padrão de regex para o formato real do seu PDF

---

**Parser melhorado em:** `/js/modules/pdf-parser.js`  
**Diagnostic tool:** `/diagnostic-pdf.html`  
**Importer UI:** `/importer.html`
