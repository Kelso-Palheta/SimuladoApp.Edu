# Product Requirements Document (PRD) — Integração Simulado App & SimuladoApp.Edu

Este documento define os requisitos de negócio e funcionais para a integração automática de notas de simulados entre a plataforma **Simulado App** (Django/Flutter) e a plataforma **SimuladoApp.Edu** (Next.js/Firestore).

---

## 1. Visão Geral do Produto

O **Simulado App** é uma plataforma focada na aplicação e correção de simulados (provas objetivas e discursivas) via aplicativo mobile. O **SimuladoApp.Edu** é a plataforma de gestão pedagógica onde os professores mantêm seus diários de classe, frequências e notas bimestrais.

Atualmente, quando um aluno realiza um simulado no **Simulado App**, o professor precisa exportar as notas manualmente e digitá-las uma a uma no campo "Simulado" do diário pedagógico no **SimuladoApp.Edu**.

Este projeto visa **automatizar essa sincronização**. Assim que um resultado de simulado for computado no **Simulado App**, a nota será automaticamente enviada e atualizada no diário pedagógico correspondente no **SimuladoApp.Edu**.

---

## 2. Personas & Histórias de Usuário

### Persona Principal: Professor (Usuário de Ambos os Sistemas)
*   **História de Usuário 1:** Como professor, eu quero que as notas dos meus alunos obtidas no Simulado App apareçam automaticamente no meu diário pedagógico (SimuladoApp.Edu) para que eu não precise digitar manualmente.
*   **História de Usuário 2:** Como professor, eu quero que o sistema identifique os alunos pelo nome completo de forma flexível para garantir que as notas sejam vinculadas aos alunos corretos mesmo com pequenas divergências de grafia ou acentuação.
*   **História de Usuário 3:** Como professor, eu quero que as notas sejam importadas e escaladas proporcionalmente de acordo com a pontuação máxima configurada para o simulado no meu diário (ex: se o aluno tirou 80% no simulado e a nota máxima do simulado configurada no diário é 5.0, a nota lançada deve ser 4.0).

---

## 3. Requisitos Funcionais

### RF-01: Disparo de Webhook no Simulado App (Django)
*   O Simulado App deve disparar uma notificação HTTP (Webhook) sempre que um novo resultado de simulado for salvo (pós-save do modelo `Resultado` no endpoint `/api/resultados/submit/`).
*   A notificação deve conter:
    *   **aluno_nome**: Nome completo do aluno (string).
    *   **aluno_email**: E-mail do aluno (string, opcional).
    *   **simulado_id**: ID único do simulado no banco de dados (string/int).
    *   **simulado_titulo**: Título do simulado (string).
    *   **bimestre**: Número do bimestre correspondente (inteiro de 1 a 4).
    *   **pontuacao_porcentagem**: Pontuação percentual obtida (float, 0.0 a 100.0).
    *   **professor_email**: E-mail do professor associado (string).
    *   **professor_uid**: Identificador único do professor (string).

### RF-02: Recebimento e Processamento no SimuladoApp.Edu (Next.js)
*   O SimuladoApp.Edu deve expor um endpoint de API seguro `/api/integracao/simulado` para receber as notas enviadas pelo Webhook.
*   O endpoint deve autenticar a chamada por meio de um token secreto compartilhado (`SHARED_INTEGRATION_KEY`) passado no header HTTP `Authorization: Bearer <TOKEN>`.

### RF-03: Mapeamento de Alunos e Turmas (Resolução de Vínculos)
*   O SimuladoApp.Edu deve localizar a turma e o aluno correspondentes:
    1.  Buscar pelo professor correspondente no Firestore usando o `professor_uid`.
    2.  Obter o documento de turmas do diário do professor.
    3.  Encontrar o aluno dentro das turmas do professor comparando o nome de forma normalizada (removendo acentos, convertendo para minúsculas e comparando strings limpas).
*   Se o aluno for localizado, a nota do simulado do bimestre correspondente deve ser gravada no diário.

### RF-04: Cálculo Proporcional da Nota (Escalonamento)
*   A nota recebida (em porcentagem de 0 a 100) deve ser escalada para a nota máxima configurada para o Simulado no Diário (`simuladoMaxLanca`, padrão `5.0`).
*   Fórmula: `Nota Lançada = (pontuacao_porcentagem / 100) * Nota Máxima do Diário`.
*   A nota final deve ser arredondada para duas casas decimais.

---

## 4. Requisitos Não Funcionais (Segurança & Performance)

*   **Segurança (Tokenização):** Toda comunicação de webhook deve ser autenticada com uma chave de segurança compartilhada definida nas variáveis de ambiente de ambos os servidores.
*   **Performance (Assincronismo):** O disparo de requisições do Django deve ocorrer em background (assíncrono/threading) para evitar que falhas de rede na API externa impactem a experiência ou causem timeouts no aplicativo móvel durante a submissão de cartões-resposta.
*   **Idempotência:** O processamento no Firestore no SimuladoApp.Edu deve sobrescrever a nota do aluno no bimestre em questão de forma segura, garantindo consistência mesmo em caso de múltiplos reenvios.
