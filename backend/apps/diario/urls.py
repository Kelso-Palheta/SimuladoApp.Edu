from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TurmaViewSet, EstudanteViewSet, PublicarNotasBatchView

router = DefaultRouter()
router.register(r'turmas', TurmaViewSet, basename='turma')
router.register(r'estudantes', EstudanteViewSet, basename='estudante')

urlpatterns = [
    path('', include(router.urls)),
    path('turmas/<int:turma_id>/publicar-notas/', PublicarNotasBatchView.as_view(), name='publicar_notas_batch'),
]
