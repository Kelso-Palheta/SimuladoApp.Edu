# 📚 Documentação — SimuladoApp.Edu

Centro de toda a documentação do projeto. Organizado por finalidade.

---

## 🎯 Acesso rápido — o que você procura?

### "Quero entender o que vamos construir"
→ **[PRD v4.2 (Word)](./PRD/v42/SimuladoAppEdu_PRD_v42.docx)** ⭐ fonte da verdade
→ [PRD v4.2 (Markdown editável)](./PRD/v42/SimuladoAppEdu_PRD_v42.md)
→ [Resumo executivo](./PRD/v42/SimuladoAppEdu_PRD_v42.md#13-resumo-executivo)

### "Quero ver o que mudou desde a versão anterior"
→ **[CHANGELOG v4.1 → v4.2](./PRD/v42/CHANGELOG_v41_v42.md)** — todas as mudanças aplicadas

### "Quero entender o porquê das decisões"
→ **[Análise crítica do PRD v4.1](./analises/PRD_v41_analise_critica/Analise_Critica_PRD_v41.md)** — análise técnica/pedagógica/produto que gerou o v4.2

### "Quero implementar um módulo específico"
→ **[Especificações técnicas](./especificacoes/)** — detalhamento por módulo

### "Quero saber o que tem na pasta e o que não vai ser usado"
→ **[Inventário de documentos](./analises/Inventario_Documentos_v42/Inventario_Documentos_Projeto.md)**

---

## 🗂️ Estrutura completa

```
docs/
│
├── PRD/                              ← Product Requirements Document
│   └── v42/                          ← Versão vigente
│       ├── SimuladoAppEdu_PRD_v42.docx       ⭐ fonte da verdade
│       ├── SimuladoAppEdu_PRD_v42.md         (editável em Git)
│       ├── CHANGELOG_v41_v42.docx
│       └── CHANGELOG_v41_v42.md
│
├── especificacoes/                   ← Specs técnicas de módulos
│   ├── organizadores_horario/        →  vincula com §4.10 do PRD
│   │   ├── ESPECIFICACAO_Organizadores_Horario.docx
│   │   └── RESUMO_Novos_Organizadores.docx
│   │
│   ├── assistentes_pedagogicos/      →  vincula com §3 do PRD
│   │   ├── Analise_Niveis_Assistentes.docx
│   │   └── analise_niveis_assistentes.md
│   │
│   └── aula_gamificada/              →  vincula com §3.0.2 + §4.1 do PRD
│       └── Relatorio_Funcionalidades_AulaGamificada.docx
│
└── analises/                         ← Análises e inventários
    ├── PRD_v41_analise_critica/
    │   ├── Analise_Critica_PRD_v41.docx
    │   └── Analise_Critica_PRD_v41.md
    │
    └── Inventario_Documentos_v42/
        ├── Inventario_Documentos_Projeto.docx
        └── Inventario_Documentos_Projeto.md
```

---

## 🔗 Mapa: capítulo do PRD ↔ documento de referência

Use esta tabela para localizar a especificação técnica de cada parte do PRD:

| Capítulo do PRD v4.2 | Documentação detalhada |
|---|---|
| **§1** Visão Geral | PRD (auto-contido) |
| **§2** Perfis de Usuário | PRD (auto-contido) |
| **§3** Os 13 Agentes de Disciplina | [`especificacoes/assistentes_pedagogicos/`](./especificacoes/assistentes_pedagogicos/) |
| **§3.0.2** Gamificação Básica | [`especificacoes/aula_gamificada/`](./especificacoes/aula_gamificada/) |
| **§4.1** Gamificação Avançada | [`especificacoes/aula_gamificada/`](./especificacoes/aula_gamificada/) |
| **§4.4** Calendário Pedagógico | [`../Planejador_e_Organizador/docs/`](../Planejador_e_Organizador/docs/) + código |
| **§4.8** Planejador Curricular | [`../Planejador_e_Organizador/docs/gerador-planejamento-spec.md`](../Planejador_e_Organizador/docs/gerador-planejamento-spec.md) |
| **§4.10** Organizadores de Horário | [`especificacoes/organizadores_horario/`](./especificacoes/organizadores_horario/) |
| **§5** Arquitetura de IA | PRD (auto-contido) — refatorar `gemini_service.py` |
| **§6** Briefing Pedagógico | PRD (auto-contido) — implementar do zero |
| **§7-8** Segurança e LGPD | PRD (auto-contido) — auditoria externa em Fase 0 |
| **§10** Unit Economics | PRD (auto-contido) |
| **§11** Roadmap com KPIs | PRD + `especificacoes/assistentes_pedagogicos/Analise_Niveis_Assistentes.docx` |
| **§12** Validação de Usuário | PRD (auto-contido) — executar pesquisa antes da Fase 1 |
| **§14** Análise Competitiva | PRD (auto-contido) |

---

## 📂 Sobre os documentos arquivados

A pasta [`../archive/`](../archive/) contém ~60 documentos antigos de prompt engineering (março/2026) que **não são referência ativa** para a implementação. Foram preservados por valor histórico — algumas ideias podem inspirar features futuras (v5+).

Ver [`Inventario_Documentos_Projeto.md`](./analises/Inventario_Documentos_v42/Inventario_Documentos_Projeto.md) para a lista completa do que foi arquivado e por quê.

---

## ✍️ Convenções

- **Idioma:** documentação em português brasileiro.
- **Formatos:** docs principais sempre em par `.docx` + `.md` (Markdown é a fonte editável; Word é o rendering distribuível).
- **Versionamento:** PRDs e specs majores ficam em pastas versionadas (`PRD/v42/`); incrementos pequenos sobrescrevem.
- **Nunca commitar:** `.env`, credenciais, dados de aluno.

---

*Atualizado em: 25 de maio de 2026*
