import pytest
import io
import json
from uuid import uuid4
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.services.planning_service import PlanningService
from app.models.planejamento import PlanejamentoAnual, PlanejamentoBimestral, PlanejamentoHorario
from app.models.aula import Conteudo, AulaPlano
from app.models.calendario import CalendarioEscolar
from app.schemas.planning import GerarPlanejamentoRequest


# Fixture para banco de dados SQLite em memória
@pytest.fixture(name="db_session")
def fixture_db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    
    # Importar todos os modelos para garantir que a metadata esteja populada
    from app.models.planejamento import PlanejamentoAnual
    from app.models.aula import Conteudo
    from app.models.calendario import CalendarioEscolar
    from app.models.observacao import ObservacaoAula
    
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


class TestPlanningExtraction:
    def test_extrair_texto_pdf_simulado(self, db_session):
        service = PlanningService(db_session)
        dummy_content = b"PDF dummy content"

        with patch("pypdf.PdfReader") as MockPdfReader:
            mock_reader = MagicMock()
            mock_page = MagicMock()
            mock_page.extract_text.return_value = "Texto extraido do PDF de teste"
            mock_reader.pages = [mock_page]
            MockPdfReader.return_value = mock_reader

            text = service._extrair_texto_pdf(dummy_content)
            assert text == "Texto extraido do PDF de teste"
            MockPdfReader.assert_called_once()

    def test_extrair_texto_docx_simulado(self, db_session):
        service = PlanningService(db_session)
        dummy_content = b"DOCX dummy content"

        with patch("docx.Document") as MockDocument:
            mock_doc = MagicMock()
            mock_para = MagicMock()
            mock_para.text = "Texto extraido do DOCX de teste"
            mock_doc.paragraphs = [mock_para]
            MockDocument.return_value = mock_doc

            text = service._extrair_texto_docx(dummy_content)
            assert "Texto extraido do DOCX de teste" in text
            MockDocument.assert_called_once()

    @pytest.mark.asyncio
    async def test_importar_por_arquivo_multi_serie(self, db_session):
        service = PlanningService(db_session)
        dummy_content = b"PDF dummy content"

        # Mock da extração de texto
        service._extrair_texto_pdf = MagicMock(return_value="Conteúdo do PDF")

        # Mock do Gemini retornando dois planejamentos (1º e 2º ano)
        mock_gemini_output = {
            "planejamentos": [
                {
                    "disciplina": "Química",
                    "serie": "1º Ano EM",
                    "ano_letivo": 2026,
                    "carga_horaria_semanal": 2,
                    "bimestres": [
                        {
                            "numero": 1,
                            "titulo": "Química Geral",
                            "temas_principais": "Tabela Periódica",
                            "carga_horaria": 20,
                            "conteudos": []
                        }
                    ]
                },
                {
                    "disciplina": "Química",
                    "serie": "2º Ano EM",
                    "ano_letivo": 2026,
                    "carga_horaria_semanal": 2,
                    "bimestres": [
                        {
                            "numero": 1,
                            "titulo": "Físico-Química",
                            "temas_principais": "Soluções",
                            "carga_horaria": 20,
                            "conteudos": []
                        }
                    ]
                }
            ]
        }

        with patch.object(service.gemini, "importar_planejamento_de_texto", return_value=mock_gemini_output) as mock_import:
            res = await service.importar_por_arquivo(
                file_content=dummy_content,
                file_name="planejamento.pdf",
                disciplina_sugerida="Química",
                serie_sugerida="1º Ano EM",
                ano_letivo_sugerido=2026
            )

            assert len(res) == 2
            
            # Primeiro planejamento (1º Ano)
            assert res[0]["disciplina"] == "Química"
            assert res[0]["serie"] == "1º Ano EM"
            assert res[0]["carga_horaria_semanal"] == 2
            
            # Segundo planejamento (2º Ano)
            assert res[1]["disciplina"] == "Química"
            assert res[1]["serie"] == "2º Ano EM"
            assert res[1]["carga_horaria_semanal"] == 2

            mock_import.assert_called_once()


class TestPlanningHorariosAndDistribution:
    def test_salvar_e_obter_horarios(self, db_session):
        service = PlanningService(db_session)
        
        # Criar planejamento anual fake para chave estrangeira
        plano = PlanejamentoAnual(
            id=uuid4(),
            professor_id="prof-test",
            disciplina="Matemática",
            serie="1º Ano",
            carga_horaria_semanal=2,
            carga_horaria_anual=80,
            ano_letivo=2026,
            status="ativo",
            created_at=datetime.utcnow()
        )
        db_session.add(plano)
        db_session.commit()

        horarios_data = [
            {"dia_semana": 2, "horario_inicio": "08:00", "duracao_minutos": 50},  # Segunda
            {"dia_semana": 4, "horario_inicio": "10:00", "duracao_minutos": 50},  # Quarta
        ]

        # Salvar horários
        salvos = service.salvar_horarios(plano.id, horarios_data)
        assert len(salvos) == 2
        assert salvos[0]["dia_semana"] == 2
        assert salvos[0]["horario_inicio"] == "08:00"

        # Obter horários
        obtidos = service.obter_horarios(plano.id)
        assert len(obtidos) == 2
        assert obtidos[1]["dia_semana"] == 4
        assert obtidos[1]["horario_inicio"] == "10:00"

    @pytest.mark.asyncio
    async def test_distribuir_conteudos_manual(self, db_session):
        service = PlanningService(db_session)
        plano_id = uuid4()
        professor_id = "prof-test"

        # Criar planejamento anual
        plano = PlanejamentoAnual(
            id=plano_id,
            professor_id=professor_id,
            disciplina="Matemática",
            serie="1º Ano",
            carga_horaria_semanal=2,
            carga_horaria_anual=80,
            ano_letivo=2026,
            status="ativo",
            created_at=datetime.utcnow()
        )
        db_session.add(plano)

        # Criar planejamento bimestral
        bimestre = PlanejamentoBimestral(
            id=uuid4(),
            planejamento_anual_id=plano_id,
            bimestre=1,
            titulo="Primeiro Bimestre",
            carga_horaria=20
        )
        db_session.add(bimestre)
        db_session.flush()

        # Criar conteúdos didáticos
        c1 = Conteudo(
            id=uuid4(),
            planejamento_bimestral_id=bimestre.id,
            titulo="Equações do Primeiro Grau",
            descricao="Estudo de equações simples",
            carga_horaria_estimada=2,
            habilidade_bncc="EF09MA06"
        )
        c2 = Conteudo(
            id=uuid4(),
            planejamento_bimestral_id=bimestre.id,
            titulo="Sistemas de Equações",
            descricao="Resolução de sistemas",
            carga_horaria_estimada=1,
            habilidade_bncc="EF09MA07"
        )
        db_session.add(c1)
        db_session.add(c2)

        # Salvar horários (Segunda e Quarta)
        horarios_data = [
            {"dia_semana": 2, "horario_inicio": "08:00", "duracao_minutos": 50},  # Segunda-feira
            {"dia_semana": 4, "horario_inicio": "10:00", "duracao_minutos": 50},  # Quarta-feira
        ]
        service.salvar_horarios(plano_id, horarios_data)

        # Criar calendário escolar fake (01/02/2026 até 15/02/2026)
        cal = CalendarioEscolar(
            id=uuid4(),
            professor_id=professor_id,
            ano_letivo=2026,
            data_inicio=datetime(2026, 2, 1),
            data_fim=datetime(2026, 2, 15),
            feriados_json=json.dumps({"datas": ["2026-02-09"]}),  # Feriado em uma segunda-feira
            dias_semana="[]",
            horario_inicio="[]"
        )
        db_session.add(cal)
        db_session.commit()

        # Slots esperados no intervalo [01/02/2026, 15/02/2026]:
        # - 02/02 (Segunda): Slot 1 (08:00)
        # - 04/02 (Quarta): Slot 2 (10:00)
        # - 09/02 (Segunda): Feriado (Pulado)
        # - 11/02 (Quarta): Slot 3 (10:00)
        # Total de slots = 3.
        # Conteúdos demandam: c1 (2 aulas) + c2 (1 aula) = 3 aulas.

        res = await service.distribuir_conteudos_manual(plano_id, professor_id)
        
        assert res["total"] == 3
        assert res["nao_alocados"] == 0
        
        aulas = db_session.query(AulaPlano).filter_by(planejamento_bimestral_id=bimestre.id).order_by(AulaPlano.data).all()
        assert len(aulas) == 3
        assert aulas[0].conteudo_id == c1.id
        assert aulas[0].data == datetime(2026, 2, 2, 8, 0)
        assert aulas[1].conteudo_id == c1.id
        assert aulas[1].data == datetime(2026, 2, 4, 10, 0)
        assert aulas[2].conteudo_id == c2.id
        assert aulas[2].data == datetime(2026, 2, 11, 10, 0)

    def test_deletar_planejamento_cascade(self, db_session):
        service = PlanningService(db_session)
        plano_id = uuid4()
        professor_id = "prof-test"

        plano = PlanejamentoAnual(
            id=plano_id,
            professor_id=professor_id,
            disciplina="Química",
            serie="3º Ano EM",
            carga_horaria_semanal=2,
            carga_horaria_anual=80,
            ano_letivo=2026,
            status="ativo",
            created_at=datetime.utcnow()
        )
        db_session.add(plano)
        
        bimestre = PlanejamentoBimestral(
            id=uuid4(),
            planejamento_anual_id=plano_id,
            bimestre=1,
            titulo="Química Geral",
            carga_horaria=20
        )
        db_session.add(bimestre)
        db_session.flush()

        conteudo = Conteudo(
            id=uuid4(),
            planejamento_bimestral_id=bimestre.id,
            titulo="Tabela Periódica",
            descricao="Estudo dos elementos",
            carga_horaria_estimada=2
        )
        db_session.add(conteudo)

        aula = AulaPlano(
            id=uuid4(),
            planejamento_bimestral_id=bimestre.id,
            conteudo_id=conteudo.id,
            data=datetime(2026, 2, 2, 8, 0),
            titulo="Aula Tabela Periódica"
        )
        db_session.add(aula)
        db_session.commit()

        # Verifica que os objetos estão no banco
        assert db_session.query(PlanejamentoAnual).count() == 1
        assert db_session.query(PlanejamentoBimestral).count() == 1
        assert db_session.query(Conteudo).count() == 1
        assert db_session.query(AulaPlano).count() == 1

        # Executa deleção
        res = service.deletar_planejamento(plano_id)
        assert res is True

        # Verifica cascade
        assert db_session.query(PlanejamentoAnual).count() == 0
        assert db_session.query(PlanejamentoBimestral).count() == 0
        assert db_session.query(Conteudo).count() == 0
        assert db_session.query(AulaPlano).count() == 0

    def test_editar_planejamento(self, db_session):
        service = PlanningService(db_session)
        plano_id = uuid4()

        plano = PlanejamentoAnual(
            id=plano_id,
            professor_id="prof-test",
            disciplina="Química",
            serie="3º Ano EM",
            carga_horaria_semanal=2,
            carga_horaria_anual=80,
            ano_letivo=2026,
            status="ativo",
            created_at=datetime.utcnow()
        )
        db_session.add(plano)
        db_session.commit()

        class MockRequest:
            disciplina = "Física Avançada"
            serie = "2º Ano EM"
            turma = "Turma C"
            carga_horaria_semanal = 4
            ano_letivo = 2027

        res = service.editar_planejamento(plano_id, MockRequest())
        
        assert res.disciplina == "Física Avançada"
        assert res.serie == "2º Ano EM"
        assert res.turma == "Turma C"
        assert res.carga_horaria_semanal == 4
        assert res.carga_horaria_anual == 160  # 4 * 40
        assert res.ano_letivo == 2027


class TestPlanningAPI:
    @pytest.fixture(autouse=True)
    def setup_mocks(self):
        from unittest.mock import AsyncMock
        # Mocking the service calls in routers to decouple API tests from DB/Gemini
        self.mock_service = MagicMock()
        self.mock_service.importar_por_arquivo = AsyncMock()
        self.mock_service.distribuir_conteudos_manual = AsyncMock()
        
        self.patcher = patch("app.routers.planning.PlanningService", return_value=self.mock_service)
        self.patcher.start()
        yield
        self.patcher.stop()

    def test_upload_planejamento_endpoint(self):
        client = TestClient(app)
        
        self.mock_service.importar_por_arquivo.return_value = [
            {
                "disciplina": "História",
                "serie": "6º Ano",
                "carga_horaria_semanal": 3,
                "carga_horaria_anual": 120,
                "ano_letivo": 2026,
                "bimestres": []
            }
        ]

        # Simular upload de arquivo
        file_data = {"file": ("planejamento.pdf", b"pdf content", "application/pdf")}
        form_data = {
            "professor_id": "prof-123",
            "ano_letivo": "2026"
        }

        response = client.post("/api/planning/upload", files=file_data, data=form_data)
        
        assert response.status_code == 201
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["disciplina"] == "História"
        assert data[0]["serie"] == "6º Ano"
        assert "turma" not in data[0]
        self.mock_service.importar_por_arquivo.assert_called_once()

    def test_batch_salvar_planejamentos_endpoint(self):
        client = TestClient(app)
        
        self.mock_service.salvar_planejamentos_lote.return_value = [
            {
                "id": "11111111-2222-3333-4444-555555555555",
                "professor_id": "prof-123",
                "disciplina": "História",
                "serie": "6º Ano",
                "turma": "601",
                "carga_horaria_semanal": 3,
                "carga_horaria_anual": 120,
                "ano_letivo": 2026,
                "status": "ativo",
                "carga_warning": False,
                "bimestres": [],
                "created_at": "2026-05-21T18:00:00"
            },
            {
                "id": "22222222-3333-4444-5555-666666666666",
                "professor_id": "prof-123",
                "disciplina": "História",
                "serie": "6º Ano",
                "turma": "602",
                "carga_horaria_semanal": 3,
                "carga_horaria_anual": 120,
                "ano_letivo": 2026,
                "status": "ativo",
                "carga_warning": False,
                "bimestres": [],
                "created_at": "2026-05-21T18:00:00"
            }
        ]

        payload = {
            "professor_id": "prof-123",
            "planejamentos": [
                {
                    "disciplina": "História",
                    "serie": "6º Ano",
                    "carga_horaria_semanal": 3,
                    "carga_horaria_anual": 120,
                    "ano_letivo": 2026,
                    "turmas": ["601", "602"],
                    "bimestres": []
                }
            ]
        }

        response = client.post("/api/planning/batch", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        assert data[0]["turma"] == "601"
        assert data[1]["turma"] == "602"
        self.mock_service.salvar_planejamentos_lote.assert_called_once()

    def test_salvar_horarios_endpoint(self):
        client = TestClient(app)
        plano_id = str(uuid4())
        
        self.mock_service.salvar_horarios.return_value = [
            {"id": str(uuid4()), "dia_semana": 3, "horario_inicio": "07:30", "duracao_minutos": 50}
        ]

        payload = {
            "horarios": [
                {"dia_semana": 3, "horario_inicio": "07:30", "duracao_minutos": 50}
            ]
        }

        response = client.post(f"/api/planning/{plano_id}/schedule", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["dia_semana"] == 3
        assert data[0]["horario_inicio"] == "07:30"
        self.mock_service.salvar_horarios.assert_called_once()

    def test_obter_horarios_endpoint(self):
        client = TestClient(app)
        plano_id = str(uuid4())

        self.mock_service.obter_horarios.return_value = [
            {"id": str(uuid4()), "dia_semana": 5, "horario_inicio": "09:15", "duracao_minutos": 50}
        ]

        response = client.get(f"/api/planning/{plano_id}/schedule")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["dia_semana"] == 5
        self.mock_service.obter_horarios.assert_called_once()

    def test_distribuir_manual_endpoint(self):
        client = TestClient(app)
        plano_id = str(uuid4())

        self.mock_service.distribuir_conteudos_manual.return_value = {
            "aulas_criadas": [
                {"id": str(uuid4()), "data": "2026-02-02T08:00:00", "conteudo_id": str(uuid4()), "titulo": "Aula 1"}
            ],
            "total": 1,
            "nao_alocados": 0
        }

        payload = {"professor_id": "prof-123"}
        response = client.post(f"/api/planning/{plano_id}/distribute-manual", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["aulas_criadas"]) == 1
        assert data["aulas_criadas"][0]["titulo"] == "Aula 1"
        self.mock_service.distribuir_conteudos_manual.assert_called_once_with(
            uuid4().__class__(plano_id), "prof-123"
        )

    def test_listar_planejamentos_endpoint(self):
        client = TestClient(app)
        
        self.mock_service.listar_planejamentos.return_value = [
            {
                "id": "11111111-2222-3333-4444-555555555555",
                "professor_id": "prof-123",
                "disciplina": "História",
                "serie": "6º Ano",
                "carga_horaria_semanal": 3,
                "carga_horaria_anual": 120,
                "ano_letivo": 2026,
                "status": "ativo",
                "carga_warning": False,
                "bimestres": [],
                "created_at": "2026-05-21T18:00:00"
            }
        ]

        response = client.get("/api/planning?professor_id=prof-123")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["disciplina"] == "História"
        self.mock_service.listar_planejamentos.assert_called_once_with("prof-123")

    def test_deletar_planejamento_endpoint(self):
        client = TestClient(app)
        plano_id = str(uuid4())
        
        self.mock_service.deletar_planejamento.return_value = True

        response = client.delete(f"/api/planning/{plano_id}")
        assert response.status_code == 200
        assert response.json()["status"] == "success"
        self.mock_service.deletar_planejamento.assert_called_once()

    def test_editar_planejamento_endpoint(self):
        client = TestClient(app)
        plano_id = str(uuid4())

        self.mock_service.editar_planejamento.return_value = {
            "id": plano_id,
            "professor_id": "prof-123",
            "disciplina": "História Editada",
            "serie": "7º Ano",
            "carga_horaria_semanal": 4,
            "carga_horaria_anual": 160,
            "ano_letivo": 2026,
            "status": "ativo",
            "carga_warning": False,
            "bimestres": [],
            "created_at": "2026-05-21T18:00:00"
        }

        payload = {
            "disciplina": "História Editada",
            "carga_horaria_semanal": 4
        }
        response = client.patch(f"/api/planning/{plano_id}", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["disciplina"] == "História Editada"
        assert data["carga_horaria_semanal"] == 4
        self.mock_service.editar_planejamento.assert_called_once()



