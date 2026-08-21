# 🌐 Especificação de APIs e Contratos (API_SPEC) — SimuladoApp.Edu

## 1. Integração com Maritaca AI / LLM

### 1.1 Endpoint de Correção de Redação
- **URL:** `https://chat.maritaca.ai/api/chat/inference`
- **Método:** `POST`
- **Headers:**
  ```http
  Authorization: Key <MARITALK_API_KEY>
  Content-Type: application/json
  ```
- **Payload Request:**
  ```json
  {
    "model": "sabiazinho-4",
    "messages": [
      { "role": "system", "content": "Prompt com os critérios INEP..." },
      { "role": "user", "content": "Texto da redação e tema..." }
    ],
    "temperature": 0.2,
    "max_tokens": 2048
  }
  ```
- **Formato da Resposta:**
  ```json
  {
    "scores": {
      "c1": 160,
      "c2": 160,
      "c3": 160,
      "c4": 200,
      "c5": 160,
      "total": 840
    },
    "feedback": "Análise detalhada por competência..."
  }
  ```

---

### 1.2 Endpoint de Extração de Planejamento Anual
- **Modelo:** `sabiazinho-4`
- **Objetivo:** Converter ementas, BNCC e textos brutos em lista estruturada de tópicos com duração estimada em aulas.
