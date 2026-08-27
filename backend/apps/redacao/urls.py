from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TemaRedacaoViewSet, SubmissaoRedacaoViewSet

router = DefaultRouter()
router.register(r'temas', TemaRedacaoViewSet, basename='tema_redacao')
router.register(r'submissoes', SubmissaoRedacaoViewSet, basename='submissao_redacao')

urlpatterns = [
    path('', include(router.urls)),
]
