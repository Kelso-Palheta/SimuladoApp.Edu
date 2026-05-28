# Aula Gamificada

**Vincula com:**
- [PRD v4.2 §3.0.2 (Gamificação Básica embutida)](../../PRD/v42/SimuladoAppEdu_PRD_v42.md#302-gamificação-básica-embutida-novo-em-v42)
- [PRD v4.2 §4.1 (Agente de Gamificação Avançada)](../../PRD/v42/SimuladoAppEdu_PRD_v42.md#41-agente-de-gamificação-avançada-reescrito-em-v42)

## Documentos

| Arquivo | Conteúdo |
|---|---|
| [`Relatorio_Funcionalidades_AulaGamificada.docx`](./Relatorio_Funcionalidades_AulaGamificada.docx) | Lista de funcionalidades implementáveis: sistema de relatórios, XP/medalhas, persistência, configuração dinâmica, análise avançada |

## Como o PRD v4.2 reestrutura isso

A v4.1 tinha **uma única seção confusa** misturando "gamificação básica" e "avançada". A v4.2 separou em:

### Gamificação Básica (§3.0.2)
- **Embutida em cada um dos 13 agentes disciplinares** (sem custo extra).
- Equipes temáticas, pontuação simbólica, narrativa-fio condutor, desafio final, rubrica em PDF.
- Escopo: **uma aula**.
- Tempo de geração: **<1 minuto**.

### Gamificação Avançada (§4.1)
- **Módulo dedicado** (R$19/mês avulso ou incluso no Plano Escola).
- Campanhas bimestrais, torneios entre turmas, festivais escolares, sistemas multinível.
- Escopo: **bimestre / semestre / ano**.
- Tempo de geração: **3-10 minutos**.

## Funcionalidades prioritárias (do relatório)

Em ordem de prioridade do relatório original, com vinculação ao PRD v4.2:

| Funcionalidade | Prioridade | Tempo estimado | PRD v4.2 |
|---|---|---|---|
| Sistema de Relatórios Automáticos | 🔴 Crítico | 12-16h | Cobre §4.4 (Diário de Bordo) |
| Sistema de Recompensas (XP/Medalhas) | 🔴 Crítico | 20-24h | §4.1 (Avançada — fichas individuais) |
| Persistência de Dados (Histórico) | 🔴 Crítico | 18-20h | §4.5 (Biblioteca de Conteúdo) |
| Configuração Dinâmica de Temáticas | 🟡 Importante | 10-14h | §3 (agentes disciplinares) |
| Perfil do Professor | 🟡 Importante | 16-18h | §2.1 |
| Análise Avançada | 🟡 Importante | 22-28h | §4.4 (visão coordenador) |
