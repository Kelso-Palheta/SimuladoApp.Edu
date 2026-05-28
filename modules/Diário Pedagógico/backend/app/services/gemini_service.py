import json
import logging

from app.config import settings

logger = logging.getLogger(__name__)

PROMPT_TEMPLATE = """Você é um especialista em planejamento pedagógico brasileiro. Gere um planejamento anual completo no formato JSON.

DISCIPLINA: {disciplina}
SÉRIE/NÍVEL: {serie}
CARGA HORÁRIA SEMANAL: {carga_horaria_semanal} aulas
CARGA HORÁRIA ANUAL: {carga_horaria_anual} aulas
ANO LETIVO: {ano_letivo}
TEMAS CURRICULARES: {temas_curriculares}

REGRAS:
1. Divida o ano em 4 bimestres equilibrados em carga horária
2. Cada bimestre deve ter de 3 a 8 conteúdos
3. Cada conteúdo deve ter: titulo, descricao (1-2 frases), tipo (teoria/pratica/revisao/avaliacao), carga_estimada (em aulas)
4. A soma das cargas_estimadas dos conteúdos de cada bimestre deve igualar a carga_horaria do bimestre
5. A soma das cargas_horarias dos 4 bimestres deve igualar a carga_horaria_anual
6. Use nomenclatura alinhada à BNCC quando aplicável
7. Temas devem ser progressivos: bimestre 2 avança sobre bimestre 1, etc.

RETORNE APENAS JSON VÁLIDO, sem explicações, seguindo exatamente esta estrutura:
{{
  "ano_letivo": {ano_letivo},
  "disciplina": "{disciplina}",
  "serie": "{serie}",
  "carga_horaria_anual": {carga_horaria_anual},
  "bimestres": [
    {{
      "numero": 1,
      "titulo": "string",
      "temas_principais": "string",
      "carga_horaria": int,
      "conteudos": [
        {{
          "titulo": "string",
          "descricao": "string",
          "tipo": "teoria|pratica|revisao|avaliacao",
          "carga_estimada": int
        }}
      ]
}}"""


IMPORT_PROMPT_TEMPLATE = """Você é um especialista em planejamento pedagógico brasileiro. Analise o documento de planejamento fornecido pelo professor e extraia/estruture as informações em planejamentos anuais no formato JSON.

Sua tarefa principal é analisar o texto do documento e identificar autonomamente qual é a Disciplina (ex: Arte, Química, Língua Portuguesa) e para quais Séries/Anos Letivos (ex: 1º Ano Ensino Médio, 2º Ano Ensino Médio, 3º Ano Ensino Médio) existem planejamentos descritos.

DICAS OPCIONAIS DO PROFESSOR (use-as apenas como fallbacks secundários caso o documento seja ambíguo):
- Disciplina sugerida: {disciplina_sugerida}
- Série sugerida: {serie_sugerida}
- Ano Letivo sugerido: {ano_letivo_sugerido}

══════════════════════════════════════════════════════════════
DOCUMENTO DO PROFESSOR (extraído do arquivo enviado):
══════════════════════════════════════════════════════════════
{document_text}
══════════════════════════════════════════════════════════════

DIRETRIZES DE IDENTIFICAÇÃO E DIVISÃO:
1. Analise o texto completo acima e identifique se há múltiplos planejamentos de diferentes séries/anos letivos. Se houver, você deve OBRIGATORIAMENTE dividi-los e gerar um objeto de planejamento independente para cada série/ano letivo detectado no texto.
2. Identifique a disciplina abordada no texto. Caso o texto não especifique claramente, use a disciplina sugerida.
3. IMPORTANTE: Extraia os conteúdos, temas e tópicos REAIS que estão escritos no documento. NÃO invente conteúdos. Use fielmente o que o professor escreveu no arquivo.
4. Para cada série identificada:
   - Determine a carga horária semanal descrita no documento (ex: 2 aulas/semana). Caso não seja mencionada ou identificável, assuma o padrão de 2 aulas semanais.
   - Calcule a carga horária anual como Carga Semanal * 40 semanas letivas.
   - Divida o conteúdo pedagógico de cada série de forma equilibrada em 4 bimestres.
   - Para cada conteúdo, extraia ou infira:
      - titulo: O nome do conteúdo/tópico de forma clara, conforme descrito no documento.
      - descricao: 1 a 2 frases explicando o que será abordado, baseando-se no texto do documento.
      - tipo: "teoria", "pratica", "revisao" ou "avaliacao" (com base nas atividades ou objetivos descritos).
      - carga_estimada: Quantidade de aulas estimadas para este conteúdo (garantindo que a soma dos conteúdos feche a carga horária do bimestre).
      - habilidade_bncc: Código da habilidade da BNCC correspondente (ex: EF09LP01, EM13LP02, etc.) se mencionada ou identificável no texto do conteúdo. Se não houver, deixe null.
5. A soma das cargas estimadas dos conteúdos de cada bimestre deve igualar a carga horária do bimestre.
6. A soma das cargas horárias dos 4 bimestres deve igualar a carga horária anual calculada para aquela série.

RETORNE APENAS JSON VÁLIDO, sem explicações, seguindo exatamente esta estrutura:
{{
  "planejamentos": [
    {{
      "ano_letivo": int,
      "disciplina": "Nome da Disciplina identificada",
      "serie": "Nome da Série/Ano identificada (ex: 1º Ano Ensino Médio)",
      "carga_horaria_semanal": int,
      "carga_horaria_anual": int,
      "bimestres": [
        {{
          "numero": 1,
          "titulo": "string",
          "temas_principais": "string",
          "carga_horaria": int,
          "conteudos": [
            {{
              "titulo": "string",
              "descricao": "string",
              "tipo": "teoria|pratica|revisao|avaliacao",
              "carga_estimada": int,
              "habilidade_bncc": "string"
            }}
          ]
        }}
      ]
    }}
  ]
}}"""



class GeminiParseError(Exception):
    pass


class GeminiAPIError(Exception):
    pass


SEQUENCE_SYSTEM_PROMPT = """Você é um professor especialista em didática com 15 anos de experiência em sala de aula. Conhece profundamente a BNCC, metodologias ativas e taxonomia de Bloom.

Ao gerar uma sequência didática:
1. Use linguagem clara e objetiva
2. Objetivos específicos SEMPRE começam com verbo de ação observável
3. Etapas devem ser realistas e cronometradas — respeite o tempo de atenção da faixa etária
4. Metodologia deve mencionar a abordagem pedagógica usada
5. Recursos devem ser itens que uma escola pública brasileira típica possui
6. Avaliação deve ser prática e rápida de aplicar
7. Referências devem incluir pelo menos 1 fonte digital acessível gratuitamente"""

SEQUENCE_PROMPT_TEMPLATE = """{system_prompt}

Gere uma sequência didática completa para uma aula.

DISCIPLINA: {disciplina}
SÉRIE/NÍVEL: {serie}
BIMESTRE: {bimestre}º Bimestre
CONTEÚDO: {conteudo_titulo}
DESCRIÇÃO DO CONTEÚDO: {conteudo_descricao}
CARGA HORÁRIA ESTIMADA: {carga_estimada} aulas
HABILIDADE BNCC: {habilidade_bncc}

REGRAS:
1. Objetivo geral: 1 frase clara com verbo no infinitivo, alinhada à habilidade BNCC
2. Objetivos específicos: 3 a 5, cada um começando com verbo de ação observável
3. Metodologia: 1 parágrafo descrevendo a abordagem pedagógica
4. Recursos: 3 a 8 itens concretos disponíveis em escola pública
5. Etapas: 5 a 8 etapas, cada uma com descricao, duracao_minutos (inteiro) e estrategia
6. A soma das durações das etapas deve totalizar entre 40 e 55 minutos
7. Avaliação: 1 parágrafo com método prático de verificação de aprendizagem
8. Referências: 3 a 5 referências, incluindo pelo menos 1 link acessível gratuitamente

RETORNE APENAS JSON VÁLIDO:
{{
  "titulo": "string",
  "objetivo_geral": "string",
  "objetivos_especificos": ["string", "string", "string"],
  "metodologia": "string",
  "recursos": ["string", "string"],
  "etapas": [
    {{
      "numero": 1,
      "descricao": "string",
      "duracao_minutos": int,
      "estrategia": "string"
    }}
  ],
  "avaliacao": "string",
  "referencias": ["string", "string"]
}}"""

BLOOM_VERBS = [
    "identificar", "reconhecer", "listar", "nomear", "descrever",
    "explicar", "resumir", "classificar", "comparar", "diferenciar",
    "resolver", "usar", "demonstrar", "executar", "aplicar",
    "analisar", "examinar", "investigar", "criar", "planejar",
    "produzir", "elaborar", "argumentar", "criticar", "julgar",
    "avaliar", "defender", "relacionar", "interpretar", "deduzir",
    "compor", "organizar", "desenvolver", "construir", "selecionar",
]


RESCHEDULE_PROMPT_TEMPLATE = """Você é um assistente de planejamento pedagógico. Sugira novas datas para conteúdos não cobertos.

DISCIPLINA: {disciplina}
SÉRIE: {serie}
CONTEÚDO NÃO COBERTO: {conteudo_titulo}
DESCRIÇÃO: {conteudo_descricao}
PRIORIDADE: {prioridade}
DATA ORIGINAL PREVISTA: {data_original}

SLOTS DISPONÍVEIS (datas sem conteúdo alocado):
{slots_disponiveis}

REGRAS:
1. Escolha a data mais próxima da data original, respeitando a prioridade do conteúdo
2. Prioridade 1 (alta): alocar na primeira data disponível
3. Prioridade 2 (média): alocar com até 2 semanas de distância
4. Prioridade 3 (baixa): alocar com até 4 semanas de distância
5. Justifique brevemente cada sugestão

RETORNE APENAS JSON:
{{
  "propostas": [
    {{
      "slot_id": "uuid",
      "data": "YYYY-MM-DD",
      "justificativa": "string"
    }}
  ]
}}"""


class GeminiService:
    MODEL = "gemini-2.5-flash-lite"
    MAX_RETRIES = 2

    async def gerar_planejamento(
        self,
        disciplina: str,
        serie: str,
        carga_horaria_semanal: int,
        carga_horaria_anual: int,
        ano_letivo: int,
        temas: list[str],
    ) -> dict:
        prompt = self._build_prompt(
            disciplina=disciplina,
            serie=serie,
            carga_horaria_semanal=carga_horaria_semanal,
            carga_horaria_anual=carga_horaria_anual,
            ano_letivo=ano_letivo,
            temas=temas,
        )

        last_error = None
        for attempt in range(self.MAX_RETRIES):
            try:
                response_text = await self._call_gemini(prompt)
                return self._parse_response(response_text)
            except json.JSONDecodeError as e:
                last_error = e
                logger.warning("Gemini JSON parse falhou (tentativa %d/%d)", attempt + 1, self.MAX_RETRIES)
                prompt = self._append_json_reminder(prompt)
            except Exception as e:
                last_error = e
                logger.error("Gemini API erro (tentativa %d/%d): %s", attempt + 1, self.MAX_RETRIES, str(e))

        if isinstance(last_error, json.JSONDecodeError):
            raise GeminiParseError("IA retornou JSON inválido após 2 tentativas. Tente novamente.")
        raise GeminiAPIError(f"Falha ao comunicar com o serviço de IA: {str(last_error)}")

    async def importar_planejamento_de_texto(
        self,
        document_text: str,
        disciplina_sugerida: str | None = None,
        serie_sugerida: str | None = None,
        ano_letivo_sugerido: int | None = None,
    ) -> dict:
        prompt = IMPORT_PROMPT_TEMPLATE.format(
            disciplina_sugerida=disciplina_sugerida or "Não informada",
            serie_sugerida=serie_sugerida or "Não informada",
            ano_letivo_sugerido=ano_letivo_sugerido or 2026,
            document_text=document_text,
        )

        last_error = None
        for attempt in range(self.MAX_RETRIES):
            try:
                response_text = await self._call_gemini(prompt)
                return self._parse_response(response_text)
            except json.JSONDecodeError as e:
                last_error = e
                logger.warning("Gemini JSON parse falhou import (tentativa %d/%d)", attempt + 1, self.MAX_RETRIES)
                prompt = self._append_json_reminder(prompt)
            except Exception as e:
                last_error = e
                logger.error("Gemini API erro import (tentativa %d/%d): %s", attempt + 1, self.MAX_RETRIES, str(e))

        if isinstance(last_error, json.JSONDecodeError):
            raise GeminiParseError("IA retornou JSON inválido na importação após 2 tentativas.")
        raise GeminiAPIError(f"Falha ao comunicar com o serviço de IA na importação: {str(last_error)}")


    def _build_prompt(self, disciplina, serie, carga_horaria_semanal,
                      carga_horaria_anual, ano_letivo, temas):
        temas_str = ", ".join(temas) if temas else "Temas curriculares padrão da BNCC para a disciplina e série informadas"
        return PROMPT_TEMPLATE.format(
            disciplina=disciplina,
            serie=serie,
            carga_horaria_semanal=carga_horaria_semanal,
            carga_horaria_anual=carga_horaria_anual,
            ano_letivo=ano_letivo,
            temas_curriculares=temas_str,
        )

    async def _call_gemini(self, prompt: str) -> str:
        import google.generativeai as genai

        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(self.MODEL)

        response = await model.generate_content_async(
            prompt,
            generation_config={"response_mime_type": "application/json"},
        )
        return response.text

    def _parse_response(self, text: str) -> dict:
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return json.loads(text.strip())

    async def gerar_sequencia_didatica(
        self, disciplina: str, serie: str, bimestre: int,
        conteudo_titulo: str, conteudo_descricao: str = "",
        carga_estimada: int = 1, habilidade_bncc: str = "",
    ) -> dict:
        prompt = SEQUENCE_PROMPT_TEMPLATE.format(
            system_prompt=SEQUENCE_SYSTEM_PROMPT,
            disciplina=disciplina, serie=serie, bimestre=bimestre,
            conteudo_titulo=conteudo_titulo,
            conteudo_descricao=conteudo_descricao or "Conteúdo programático padrão",
            carga_estimada=carga_estimada,
            habilidade_bncc=habilidade_bncc or "BNCC - Competências gerais",
        )

        last_error = None
        for attempt in range(self.MAX_RETRIES):
            try:
                response_text = await self._call_gemini(prompt)
                result = self._parse_response(response_text)
                score = self._avaliar_qualidade_sequencia(result)
                if score < 60 and attempt < self.MAX_RETRIES - 1:
                    prompt = self._reforcar_criterios_sequencia(prompt, result, score)
                    continue
                return result
            except json.JSONDecodeError as e:
                last_error = e
                logger.warning("Gemini JSON parse falhou seq (tentativa %d/%d)", attempt + 1, self.MAX_RETRIES)
                prompt = self._append_json_reminder(prompt)
            except Exception as e:
                last_error = e
                logger.error("Gemini API erro seq (tentativa %d/%d): %s", attempt + 1, self.MAX_RETRIES, str(e))

        if isinstance(last_error, json.JSONDecodeError):
            raise GeminiParseError("IA retornou JSON inválido para sequência didática após 2 tentativas.")
        raise GeminiAPIError(f"Falha ao gerar sequência didática: {str(last_error)}")

    def _avaliar_qualidade_sequencia(self, resultado: dict) -> int:
        score = 0
        objetivos = resultado.get("objetivos_especificos", [])
        etapas = resultado.get("etapas", [])
        referencias = resultado.get("referencias", [])

        has_bloom = any(any(v in obj.lower() for v in BLOOM_VERBS) for obj in objetivos)
        if has_bloom:
            score += 25

        duracao_total = sum(e.get("duracao_minutos", 0) for e in etapas)
        if 40 <= duracao_total <= 55:
            score += 25

        secoes = ["titulo", "objetivo_geral", "objetivos_especificos",
                   "metodologia", "recursos", "etapas", "avaliacao", "referencias"]
        if all(resultado.get(s) for s in secoes):
            score += 20

        if len(objetivos) >= 3:
            score += 10
        if len(etapas) >= 4:
            score += 10
        if any("http" in ref.lower() for ref in referencias):
            score += 10

        return score

    def _reforcar_criterios_sequencia(self, prompt: str, resultado: dict, score: int) -> str:
        feedback = "\n\nATENÇÃO: Resposta anterior com qualidade insuficiente (score: " + str(score) + "/100). "
        objetivos = resultado.get("objetivos_especificos", [])
        etapas = resultado.get("etapas", [])

        has_bloom = any(any(v in obj.lower() for v in BLOOM_VERBS) for obj in objetivos)
        if not has_bloom:
            feedback += "OBJETIVOS: Use verbos de ação observáveis (identificar, analisar, criar...). "

        duracao_total = sum(e.get("duracao_minutos", 0) for e in etapas)
        if duracao_total < 40 or duracao_total > 55:
            feedback += f"DURAÇÃO: Soma foi {duracao_total}min. Deve ser 40-55min. "

        if len(etapas) < 4:
            feedback += "ETAPAS: Mínimo 4. "

        return prompt + "\n" + feedback + "\nRetorne JSON válido corrigindo esses pontos."

    async def gerar_reagendamento(
        self, disciplina: str, serie: str,
        conteudo_titulo: str, conteudo_descricao: str,
        prioridade: int, data_original: str, slots_disponiveis: list,
    ) -> dict:
        slots_str = "\n".join(
            f"- {s['data']} (id: {s['id']})" for s in slots_disponiveis[:15]
        )
        prompt = RESCHEDULE_PROMPT_TEMPLATE.format(
            disciplina=disciplina, serie=serie,
            conteudo_titulo=conteudo_titulo, conteudo_descricao=conteudo_descricao,
            prioridade=prioridade, data_original=data_original,
            slots_disponiveis=slots_str or "Nenhum slot disponível",
        )

        last_error = None
        for attempt in range(self.MAX_RETRIES):
            try:
                response_text = await self._call_gemini(prompt)
                result = self._parse_response(response_text)
                return result
            except json.JSONDecodeError as e:
                last_error = e
                prompt = self._append_json_reminder(prompt)
            except Exception as e:
                last_error = e
                logger.error("Gemini erro reagendamento (tentativa %d/%d): %s", attempt + 1, self.MAX_RETRIES, str(e))

        if isinstance(last_error, json.JSONDecodeError):
            raise GeminiParseError("IA retornou JSON inválido para reagendamento.")
        raise GeminiAPIError(f"Falha ao gerar reagendamento: {str(last_error)}")

    def _append_json_reminder(self, prompt: str) -> str:
        return prompt + "\n\nATENÇÃO: Sua resposta anterior não era JSON válido. Retorne APENAS um objeto JSON válido, sem texto adicional, sem markdown, sem explicações."
