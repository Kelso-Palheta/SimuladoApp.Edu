# PRD - Redação Corrigida - ENEM

## 1. Visão Geral
O **Redação Corrigida - ENEM** é um sistema de inteligência artificial especializado na avaliação e correção de redações seguindo rigorosamente os critérios do Exame Nacional do Ensino Médio (ENEM). O objetivo é fornecer aos estudantes um feedback instantâneo, detalhado e pedagógico, permitindo a evolução na escrita através da análise automática de manuscritos (fotos) ou textos digitados.

## 2. Objetivos
- **Transcriçâo Automática (OCR):** Converter fotos de folhas de redação em texto digital legível.
- **Avaliação por Competências:** Atribuir notas de 0 a 200 para cada uma das 5 competências oficiais do ENEM.
- **Análise Pedagógica:** Identificar erros gramaticais, falhas na estrutura dissertativo-argumentativa e ausência de repertório sociocultural.
- **Versatilidade de Interface:** Disponibilizar a tecnologia via Chat (Gems/OpenAI) e via API para integração em plataformas próprias.

## 3. Funcionalidades Principais (MVP)
### 3.1. Engine de Visão (Vision-to-Text)
- O sistema deve processar imagens (JPEG/PNG) de redações manuscritas.
- Realizar a transcrição fiel do texto, mantendo a divisão de parágrafos.
- Identificar rasuras ou ilegibilidade (notificando o usuário).

### 3.2. Módulo de Correção (AI Core)
- **Competência 1:** Domínio da norma culta (gramática, pontuação, ortografia).
- **Competência 2:** Compreensão do tema e aplicação de diversas áreas do conhecimento.
- **Competência 3:** Seleção, relação e interpretação de informações/argumentos.
- **Competência 4:** Conhecimento de mecanismos linguísticos (coesão e conectivos).
- **Competência 5:** Proposta de intervenção (com os 5 elementos obrigatórios: agente, ação, meio, efeito e detalhamento).

### 3.3. Feedback e Nota
- Cálculo da nota final (soma das competências, de 0 a 1000).
- Justificativa detalhada para cada nota baseada nos manuais oficiais.
- Sugestões de melhoria específicas para os erros encontrados.

## 4. Referências e Documentação Base
Para garantir a precisão, a IA deve ser treinada/alimentada com os seguintes documentos oficiais do INEP:

*   **Cartilha do Participante 2024:** [Link Oficial INEP](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos)
*   **Manuais de Correção de Redação (Treinamento de Corretores):**
    *   [Competência 1 - Norma Culta](https://download.inep.gov.br/publicacoes/institucionais/avaliacoes_e_exames_educacionais/manual_de_redacao_do_enem_2020_competencia_1.pdf)
    *   [Competência 2 - Estrutura e Tema](https://download.inep.gov.br/publicacoes/institucionais/avaliacoes_e_exames_educacionais/manual_de_redacao_do_enem_2020_competencia_2.pdf)
    *   [Competência 3 - Coerência e Argumentação](https://download.inep.gov.br/publicacoes/institucionais/avaliacoes_e_exames_educacionais/manual_de_redacao_do_enem_2020_competencia_3.pdf)
    *   [Competência 4 - Coesão](https://download.inep.gov.br/publicacoes/institucionais/avaliacoes_e_exames_educacionais/manual_de_redacao_do_enem_2020_competencia_4.pdf)
    *   [Competência 5 - Proposta de Intervenção](https://download.inep.gov.br/publicacoes/institucionais/avaliacoes_e_exames_educacionais/manual_de_redacao_do_enem_2020_competencia_5.pdf)

## 5. Requisitos Técnicos
- **LLM:** GPT-4o ou Claude 3.5 Sonnet (pela alta capacidade de visão e raciocínio lógico em português).
- **Prompt Engineering:** Uso de *Few-Shot Prompting* com exemplos de redações nota 1000 e redações com erros comuns descritos nos manuais.
- **API:** RESTful API para envio de imagens e recebimento de JSON estruturado com notas e observações.

## 6. Fluxo do Usuário
1. Usuário faz o upload da foto da redação.
2. Sistema confirma a leitura e exibe a transcrição para conferência.
3. IA analisa o texto cruzando com a base de dados do INEP.
4. Relatório de correção é gerado com nota final e dicas práticas.

---
*Documento gerado por Antigravity em 31/03/2026.*
