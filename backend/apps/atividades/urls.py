from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AtividadeBNCCViewSet, QuestaoViewSet, RespostaEstudanteViewSet

router = DefaultRouter()
router.register(r'atividades', AtividadeBNCCViewSet, basename='atividade_bncc')
router.register(r'questoes', QuestaoViewSet, basename='questao')
router.register(r'respostas', RespostaEstudanteViewSet, basename='resposta_estudante')

urlpatterns = [
    path('', include(router.urls)),
]
