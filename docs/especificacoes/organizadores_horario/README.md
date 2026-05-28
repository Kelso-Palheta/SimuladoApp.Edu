# Organizadores de Horário Escolar

**Vincula com:** [PRD v4.2 §4.10](../../PRD/v42/SimuladoAppEdu_PRD_v42.md#410-organizadores-de-horário-escolar)

## Documentos

| Arquivo | Conteúdo |
|---|---|
| [`ESPECIFICACAO_Organizadores_Horario.docx`](./ESPECIFICACAO_Organizadores_Horario.docx) | Spec técnica: algoritmos CSP (backtracking, forward-checking, AC-3), estruturas de dados, roadmap de 4 fases em 16 semanas |
| [`RESUMO_Novos_Organizadores.docx`](./RESUMO_Novos_Organizadores.docx) | Resumo executivo com proposição de valor — útil para vendas/marketing |

## Escopo

Dois organizadores:
1. **Convencional** — escolas tradicionais (turmas em salas fixas, professores circulam).
2. **Tempo Integral com Salas Temáticas** — alunos itinerantes entre salas de área (Linguagens, Matemática, CN, CH).

## Atenção crítica

> **POC obrigatório de 2 semanas antes da Fase 3** — o constraint solver para escolas reais (400+ alunos, 8 salas, 35 professores) precisa ser empiricamente validado. A promessa de "recalcula em 30s" do PRD pode não convergir em casos com hard constraints conflitantes.

Framework sugerido: **OR-Tools (Google)** ou **MiniZinc**.
