import pytest
from app.services.gemini_service import (
    GeminiService, PROMPT_TEMPLATE, SEQUENCE_PROMPT_TEMPLATE,
    RESCHEDULE_PROMPT_TEMPLATE, BLOOM_VERBS, GeminiParseError,
)


class TestPromptTemplates:
    def test_planejamento_prompt_has_all_fields(self):
        prompt = PROMPT_TEMPLATE.format(
            disciplina="Português", serie="3º EM",
            carga_horaria_semanal=5, carga_horaria_anual=200,
            ano_letivo=2026, temas_curriculares="Gramática",
        )
        assert "Português" in prompt
        assert "3º EM" in prompt
        assert "5" in prompt
        assert "200" in prompt
        assert "2026" in prompt
        assert "Gramática" in prompt
        assert "JSON" in prompt

    def test_sequence_prompt_has_pedagogical_rules(self):
        prompt = SEQUENCE_PROMPT_TEMPLATE.format(
            system_prompt="Expert", disciplina="Mat", serie="2º",
            bimestre=1, conteudo_titulo="Álgebra",
            conteudo_descricao="Equações", carga_estimada=2,
            habilidade_bncc="EM13MAT101",
        )
        assert "Álgebra" in prompt
        assert "objetivo_geral" in prompt
        assert "40 e 55 minutos" in prompt

    def test_reschedule_prompt_has_slots(self):
        prompt = RESCHEDULE_PROMPT_TEMPLATE.format(
            disciplina="História", serie="1º", conteudo_titulo="Brasil Colônia",
            conteudo_descricao="Período colonial", prioridade=2,
            data_original="2026-04-10", slots_disponiveis="- 2026-04-15 (id: x)",
        )
        assert "Brasil Colônia" in prompt
        assert "2026-04-10" in prompt
        assert "slots_disponiveis" in prompt or "2026-04-15" in prompt


class TestBloomVerbs:
    def test_common_verbs_present(self):
        assert "identificar" in BLOOM_VERBS
        assert "analisar" in BLOOM_VERBS
        assert "criar" in BLOOM_VERBS
        assert "avaliar" in BLOOM_VERBS
        assert len(BLOOM_VERBS) >= 20

    def test_bloom_detection(self):
        objetivos = ["Identificar classes gramaticais", "Analisar textos"]
        has_bloom = any(
            any(v in obj.lower() for v in BLOOM_VERBS)
            for obj in objetivos
        )
        assert has_bloom is True

    def test_no_bloom_detected(self):
        objetivos = ["Fazer exercícios", "Ler o capítulo"]
        has_bloom = any(
            any(v in obj.lower() for v in BLOOM_VERBS)
            for obj in objetivos
        )
        assert has_bloom is False


class TestGeminiService:
    def test_build_prompt_returns_str(self):
        gs = GeminiService()
        prompt = gs._build_prompt("Mat", "1º", 4, 160, 2026, ["Tema1"])
        assert isinstance(prompt, str)
        assert len(prompt) > 100

    def test_parse_response_valid_json(self):
        gs = GeminiService()
        result = gs._parse_response('{"key": "value"}')
        assert result == {"key": "value"}

    def test_parse_response_with_markdown(self):
        gs = GeminiService()
        result = gs._parse_response('```json\n{"key": "value"}\n```')
        assert result == {"key": "value"}

    def test_parse_response_invalid_json_raises(self):
        gs = GeminiService()
        with pytest.raises(Exception):
            gs._parse_response("not json")

    def test_avaliar_qualidade_perfect_score(self):
        gs = GeminiService()
        result = {
            "titulo": "Aula", "objetivo_geral": "Ensinar",
            "objetivos_especificos": ["Identificar", "Analisar", "Criar"],
            "metodologia": "Ativa", "recursos": ["Quadro"],
            "etapas": [
                {"numero": 1, "descricao": "Intro", "duracao_minutos": 10, "estrategia": "Exposição"},
                {"numero": 2, "descricao": "Prática", "duracao_minutos": 15, "estrategia": "Grupo"},
                {"numero": 3, "descricao": "Discussão", "duracao_minutos": 10, "estrategia": "Debate"},
                {"numero": 4, "descricao": "Fechamento", "duracao_minutos": 10, "estrategia": "Resumo"},
            ],
            "avaliacao": "Questionário",
            "referencias": ["http://example.com"],
        }
        score = gs._avaliar_qualidade_sequencia(result)
        assert score >= 60

    def test_avaliar_qualidade_poor_score(self):
        gs = GeminiService()
        result = {
            "titulo": "", "objetivo_geral": "",
            "objetivos_especificos": ["Fazer", "Ler"],
            "metodologia": "", "recursos": [],
            "etapas": [{"numero": 1, "descricao": "X", "duracao_minutos": 10, "estrategia": "Y"}],
            "avaliacao": "", "referencias": [],
        }
        score = gs._avaliar_qualidade_sequencia(result)
        assert score < 60
