# 📄 Product Requirements Document (PRD) — SimuladoApp.Edu

## 1. Visão Geral do Produto
O **SimuladoApp.Edu** é um Hub Pedagógico de Inteligência Artificial desenhado para automatizar as tarefas operacionais e repetitivas dos professores da Educação Básica e Ensino Médio, devolvendo até 15 horas de trabalho semanal e finais de semana livres.

---

## 2. Personas Principais
1. **Professor da Educação Básica / Ensino Médio:**
   - *Necessidade:* Lançar notas rapidamente, corrigir redações com critérios justos do ENEM, montar horários semanais e gerar simulados e atividades no padrão BNCC.
2. **Coordenador Pedagógico / Diretor:**
   - *Necessidade:* Padronização de critérios avaliativos e relatórios de acompanhamento de turmas.
3. **Aluno:**
   - *Necessidade:* Acesso transparente às suas notas publicadas e feedback detalhado das redações corrigidas via portal próprio.

---

## 3. Módulos do Sistema
1. **Diário Pedagógico (Gestão de Notas):**
   - Lançamento de notas por turma e bimestre (1º ao 4º).
   - Cálculo automático de médias ponderadas (Simulados + Atividades).
   - Publicação instantânea para o Portal do Aluno.
   - Backup e restauração local/Firestore.
2. **Redação Corrigida ENEM:**
   - Extração de texto via OCR de fotos ou documentos (PDF, DOCX, TXT).
   - Avaliação detalhada nas 5 competências do ENEM (0 a 200 pts cada).
   - Geração de devolutiva pedagógica e exportação em PDF formatado.
3. **Calendário Pedagógico:**
   - Configuração de grade horária semanal por turma.
   - Importação inteligente de planos de aula anuais com IA (`sabiazinho-4`).
   - Drag and Drop de tópicos para aulas com remanejamento automático.
4. **Gerador de Atividades & Questões:**
   - Criação de listas de exercícios e provas alinhadas à BNCC e descritores do SAEB/ENEM.
5. **Portal do Aluno:**
   - Consulta de notas bimestrais e pareceres pedagógicos com autenticação segura.

---

## 4. Critérios de Sucesso e Métricas
- **Tempo de Correção de Redação:** < 20 segundos por texto.
- **Precisão de Cálculo de Médias:** 100% de exatidão aritmética conforme os critérios configurados pelo professor.
- **Disponibilidade Offline:** Tolerância a falhas de rede com sincronização local via `localStorage`.
