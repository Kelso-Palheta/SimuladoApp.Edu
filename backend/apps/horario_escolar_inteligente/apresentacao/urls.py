"""
Roteamento Principal da API (src/apresentacao/urls.py)
"""
from django.contrib import admin
from django.urls import path

from .views import (
    ValidarGradeAPIView,
    RemanejarAulaAPIView,
    ImportarPDFAPIView,
    AssistenteIAAPIView,
    CarregarGradeAPIView,
    GerarGradeAssincronaAPIView,
    StatusTaskAPIView,
    ExportarExcelAPIView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/grade/validar/", ValidarGradeAPIView.as_view(), name="grade-validar"),
    path("api/v1/grade/remanejar/", RemanejarAulaAPIView.as_view(), name="grade-remanejar"),
    path("api/v1/grade/carregar/", CarregarGradeAPIView.as_view(), name="grade-carregar"),
    path("api/v1/grade/importar-pdf/", ImportarPDFAPIView.as_view(), name="grade-importar-pdf"),
    path("api/v1/grade/gerar-assincrono/", GerarGradeAssincronaAPIView.as_view(), name="grade-gerar-assincrono"),
    path("api/v1/grade/task-status/<str:task_id>/", StatusTaskAPIView.as_view(), name="grade-task-status"),
    path("api/v1/grade/exportar-excel/", ExportarExcelAPIView.as_view(), name="grade-exportar-excel"),
    path("api/v1/assistente/maritaca/", AssistenteIAAPIView.as_view(), name="assistente-maritaca"),
]
