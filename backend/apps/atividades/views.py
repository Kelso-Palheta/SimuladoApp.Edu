from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import AtividadeBNCC, Questao, RespostaEstudante
from .serializers import AtividadeBNCCSerializer, QuestaoSerializer, RespostaEstudanteSerializer

class AtividadeBNCCViewSet(viewsets.ModelViewSet):
    serializer_class = AtividadeBNCCSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        habilidade = self.request.query_params.get('habilidade')
        turma_id = self.request.query_params.get('turma_id')
        qs = AtividadeBNCC.objects.filter(professor=self.request.user)
        if habilidade:
            qs = qs.filter(habilidade_bncc_principal__icontains=habilidade)
        if turma_id:
            qs = qs.filter(turma_id=turma_id)
        return qs

    def perform_create(self, serializer):
        # Debita 1 credito da assinatura do professor
        if hasattr(self.request.user, 'assinatura'):
            self.request.user.assinatura.consumir_creditos(1)
        serializer.save(professor=self.request.user)

    @action(detail=True, methods=['post'], url_path='publicar')
    def alternar_publicacao(self, request, pk=None):
        atividade = self.get_object()
        atividade.publicada = not atividade.publicada
        atividade.save()
        return Response({
            'sucesso': True,
            'publicada': atividade.publicada,
            'mensagem': 'Atividade publicada para a turma!' if atividade.publicada else 'Atividade ocultada dos alunos.'
        })

class QuestaoViewSet(viewsets.ModelViewSet):
    serializer_class = QuestaoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        atividade_id = self.request.query_params.get('atividade_id')
        qs = Questao.objects.filter(atividade__professor=self.request.user)
        if atividade_id:
            qs = qs.filter(atividade_id=atividade_id)
        return qs

class RespostaEstudanteViewSet(viewsets.ModelViewSet):
    serializer_class = RespostaEstudanteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RespostaEstudante.objects.filter(questao__atividade__professor=self.request.user)
