"""
Views e Controladores da API REST (src/apresentacao/views.py)
Orquestração via Casos de Uso (Clean Architecture)
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.horario_escolar_inteligente.aplicacao.casos_de_uso import ValidarGradeUseCase, RemanejarAulaUseCase
from apps.horario_escolar_inteligente.aplicacao.dtos import (
    ValidarGradeRequisicaoDTO,
    RemanejarAulaDTO,
    PosicaoSlotDTO,
)
from apps.horario_escolar_inteligente.infraestrutura.repositorios import JSONGradeRepository
from apps.horario_escolar_inteligente.infraestrutura.adaptadores_pdf import PDFPlumberAdapter
from apps.horario_escolar_inteligente.infraestrutura.adaptadores_ia import MaritacaAIAdapter

from .serializers import (
    ValidarGradeRequestSerializer,
    RemanejarAulaRequestSerializer,
    ImportarPDFRequestSerializer,
    AssistenteIARequestSerializer,
)


class ValidarGradeAPIView(APIView):
    """
    POST /api/v1/grade/validar/
    Audita a lista de slots recebida contra regras rígidas e calcula score pedagógico.
    """

    def post(self, request):
        serializer = ValidarGradeRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        dto = ValidarGradeRequisicaoDTO(
            escola_id=serializer.validated_data.get("escola_id", "default"),
            slots=serializer.validated_data["slots"],
        )

        use_case = ValidarGradeUseCase()
        resultado = use_case.executar(dto)

        return Response(resultado.model_dump(), status=status.HTTP_200_OK)


class RemanejarAulaAPIView(APIView):
    """
    POST /api/v1/grade/remanejar/
    Executa permuta ou movimentação atômica entre 2 slots de aula.
    """

    def post(self, request):
        serializer = RemanejarAulaRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        repo = JSONGradeRepository()
        grade = repo.carregar(escola_id=data.get("escola_id", "default"))

        if not grade:
            return Response(
                {"error": "Grade escolar não encontrada"},
                status=status.HTTP_404_NOT_FOUND,
            )

        dto = RemanejarAulaDTO(
            origem=PosicaoSlotDTO(**data["origem"]),
            destino=PosicaoSlotDTO(**data["destino"]),
            forcar_se_invalido=data.get("forcar_se_invalido", False),
        )

        use_case = RemanejarAulaUseCase()
        resultado = use_case.executar(grade, dto)

        if resultado.sucesso:
            repo.salvar(escola_id=data.get("escola_id", "default"), grade=resultado.grade)
            return Response(
                {
                    "sucesso": True,
                    "mensagem": resultado.mensagem,
                    "conflitos_gerados": len(resultado.relatorio.conflitos_rigidos),
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {
                    "sucesso": False,
                    "mensagem": resultado.mensagem,
                    "conflitos": [c.model_dump() for c in resultado.relatorio.conflitos_rigidos],
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )


class ImportarPDFAPIView(APIView):
    """
    POST /api/v1/grade/importar-pdf/
    Processa upload de PDF e extrai slots de aula via motor local rápido.
    """

    def post(self, request):
        serializer = ImportarPDFRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        arquivo_pdf = request.FILES["arquivo_pdf"]
        pdf_bytes = arquivo_pdf.read()

        adapter = PDFPlumberAdapter()
        tabelas = adapter.extrair_tabelas(pdf_bytes)

        todas_linhas = []
        for tab in tabelas:
            todas_linhas.extend(tab)

        slots_extraidos = adapter.estruturar_linhas_em_slots(todas_linhas)

        return Response(
            {
                "sucesso": True,
                "total_slots_extraidos": len(slots_extraidos),
                "slots": slots_extraidos,
            },
            status=status.HTTP_200_OK,
        )


class AssistenteIAAPIView(APIView):
    """
    POST /api/v1/assistente/maritaca/
    Envia consultas em linguagem natural ao modelo Sabiá-3.
    """

    def post(self, request):
        serializer = AssistenteIARequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        try:
            adapter = MaritacaAIAdapter()
            resposta = adapter.processar_mensagem(
                prompt_sistema=data.get("prompt_sistema", ""),
                mensagem_usuario=data["mensagem_usuario"],
                contexto=data.get("contexto", {}),
            )
            return Response({"resposta": resposta}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Erro no assistente: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CarregarGradeAPIView(APIView):
    """
    GET /api/v1/grade/carregar/
    Retorna o estado completo da grade escolar.
    """

    def get(self, request):
        escola_id = request.query_params.get("escola_id", "default")
        repo = JSONGradeRepository()
        grade = repo.carregar(escola_id=escola_id)

        if not grade:
            return Response(
                {"error": "Grade escolar não encontrada"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(grade.model_dump(), status=status.HTTP_200_OK)


class GerarGradeAssincronaAPIView(APIView):
    """
    POST /api/v1/grade/gerar-assincrono/
    Enfileira a geração da grade escolar no Celery.
    """

    def post(self, request):
        escola_id = request.data.get("escola_id", 1)
        from apps.horario_escolar_inteligente.infraestrutura.tasks import gerar_grade_otimizada_task
        task = gerar_grade_otimizada_task.delay(escola_id)

        return Response(
            {
                "task_id": task.id,
                "status": "QUEUED",
                "mensagem": "Geração da grade escolar iniciada no Celery",
            },
            status=status.HTTP_202_ACCEPTED,
        )


class StatusTaskAPIView(APIView):
    """
    GET /api/v1/grade/task-status/<task_id>/
    Consulta o estado de execução de uma tarefa assíncrona no Celery.
    """

    def get(self, request, task_id):
        from celery.result import AsyncResult
        res = AsyncResult(task_id)

        return Response(
            {
                "task_id": task_id,
                "status": res.status,
                "resultado": res.result if res.ready() else None,
            },
            status=status.HTTP_200_OK,
        )


class ExportarExcelAPIView(APIView):
    """
    GET /api/v1/grade/exportar-excel/
    Gera e devolve a pasta de trabalho Excel (.xlsx) com múltiplas abas formatadas.
    """

    def get(self, request):
        from django.http import HttpResponse
        from apps.horario_escolar_inteligente.infraestrutura.gerador_excel import GeradorExcelRelatorio

        escola_id = request.query_params.get("escola_id", "default")
        repo = JSONGradeRepository()
        grade = repo.carregar(escola_id=escola_id)

        if not grade or not grade.slots:
            return Response({"error": "Nenhuma grade disponível para exportar"}, status=status.HTTP_404_NOT_FOUND)

        gerador = GeradorExcelRelatorio()
        excel_bytes = gerador.gerar_bytes(grade.slots)

        response = HttpResponse(
            excel_bytes,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="horario-escolar-2026.xlsx"'
        return response
