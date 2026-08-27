from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import models
from django.db.models import Q
from .models import TemaRedacao, SubmissaoRedacao
from .serializers import TemaRedacaoSerializer, SubmissaoRedacaoSerializer
from .tasks import processar_redacao_opencv_task

class TemaRedacaoViewSet(viewsets.ModelViewSet):
    serializer_class = TemaRedacaoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Retorna temas criados pelo professor + temas globais do ENEM (professor is null)
        return TemaRedacao.objects.filter(models.Q(professor=self.request.user) | models.Q(professor__isnull=True), ativo=True)

    def perform_create(self, serializer):
        serializer.save(professor=self.request.user)

class SubmissaoRedacaoViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissaoRedacaoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        turma_id = self.request.query_params.get('turma_id')
        tema_id = self.request.query_params.get('tema_id')
        qs = SubmissaoRedacao.objects.filter(professor=self.request.user)
        if turma_id:
            qs = qs.filter(estudante__turma_id=turma_id)
        if tema_id:
            qs = qs.filter(tema_id=tema_id)
        return qs

    def perform_create(self, serializer):
        # 1. Consome 2 créditos de IA da assinatura do professor
        if hasattr(self.request.user, 'assinatura'):
            self.request.user.assinatura.consumir_creditos(2)

        # 2. Salva registro
        submissao = serializer.save(professor=self.request.user, status='pendente')

        # 3. Dispara Celery task assíncrona
        try:
            processar_redacao_opencv_task.delay(submissao.id)
        except Exception:
            # Em ambiente de teste local sem Celery broker rodando, executa síncrono
            processar_redacao_opencv_task(submissao.id)

    @action(detail=True, methods=['post'], url_path='reprocessar')
    def reprocessar(self, request, pk=None):
        submissao = self.get_object()
        submissao.status = 'pendente'
        submissao.save()
        try:
            processar_redacao_opencv_task.delay(submissao.id)
        except Exception:
            processar_redacao_opencv_task(submissao.id)
        return Response({'sucesso': True, 'mensagem': 'Redação enviada para reprocessamento no Celery.'})
