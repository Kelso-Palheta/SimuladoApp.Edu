import pytest
from uuid import uuid4

from app.schemas.planning import (
    GerarPlanejamentoRequest,
    GerarSequenciaRequest,
    ConfirmarAulaRequest,
    CriarObservacaoRequest,
    SequenciaResponse,
    PlanejamentoResponse,
)


class TestGerarPlanejamentoRequest:
    def test_valid_input(self):
        req = GerarPlanejamentoRequest(
            professor_id="prof-1", disciplina="Português",
            serie="3º EM", carga_horaria_semanal=5, ano_letivo=2026,
        )
        assert req.disciplina == "Português"
        assert req.temas_curriculares == []

    def test_invalid_carga_zero(self):
        with pytest.raises(Exception):
            GerarPlanejamentoRequest(
                professor_id="p1", disciplina="Mat", serie="1º",
                carga_horaria_semanal=0, ano_letivo=2026,
            )

    def test_invalid_carga_max(self):
        with pytest.raises(Exception):
            GerarPlanejamentoRequest(
                professor_id="p1", disciplina="Mat", serie="1º",
                carga_horaria_semanal=51, ano_letivo=2026,
            )

    def test_invalid_ano(self):
        with pytest.raises(Exception):
            GerarPlanejamentoRequest(
                professor_id="p1", disciplina="Mat", serie="1º",
                carga_horaria_semanal=5, ano_letivo=2020,
            )

    def test_temas_default_empty(self):
        req = GerarPlanejamentoRequest(
            professor_id="p1", disciplina="Mat", serie="1º",
            carga_horaria_semanal=5, ano_letivo=2026,
        )
        assert req.temas_curriculares == []


class TestConfirmarAulaRequest:
    def test_valid_statuses(self):
        for status in ["completa", "parcial", "nao_realizada"]:
            req = ConfirmarAulaRequest(aula_id=uuid4(), status=status)
            assert req.status == status

    def test_optional_fields(self):
        req = ConfirmarAulaRequest(
            aula_id=uuid4(), status="completa",
            observacao="Boa aula", engajamento="alto",
        )
        assert req.engajamento == "alto"
