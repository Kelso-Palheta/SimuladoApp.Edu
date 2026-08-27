from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Turma, Estudante, NotaBimestral
from .serializers import TurmaSerializer, EstudanteSerializer, NotaBimestralSerializer

class TurmaViewSet(viewsets.ModelViewSet):
    serializer_class = TurmaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Turma.objects.filter(professor=self.request.user)

    def perform_create(self, serializer):
        serializer.save(professor=self.request.user)

class EstudanteViewSet(viewsets.ModelViewSet):
    serializer_class = EstudanteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        turma_id = self.request.query_params.get('turma_id')
        qs = Estudante.objects.filter(turma__professor=self.request.user)
        if turma_id:
            qs = qs.filter(turma_id=turma_id)
        return qs

    def perform_create(self, serializer):
        turma = get_object_or_404(Turma, id=self.request.data.get('turma'), professor=self.request.user)
        serializer.save(turma=turma)

class PublicarNotasBatchView(APIView):
    """
    Endpoint atomico para salvar/publicar notas de uma turma inteira em lote instantaneamente.
    Garante integridade referencial via @transaction.atomic.
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, turma_id):
        turma = get_object_or_404(Turma, id=turma_id, professor=request.user)
        bimestre = request.data.get('bimestre', 1)
        notas_payload = request.data.get('notas', [])  # Array com [{estudante_id, nota_simulado, nota_atividades, faltas, ...}]

        registros_atualizados = 0
        for item in notas_payload:
            estudante = get_object_or_404(Estudante, id=item.get('estudante_id'), turma=turma)
            
            nota_obj, _ = NotaBimestral.objects.get_or_create(
                estudante=estudante,
                bimestre=bimestre
            )
            
            if 'nota_simulado' in item:
                nota_obj.nota_simulado = item['nota_simulado']
            if 'nota_atividades' in item:
                nota_obj.nota_atividades = item['nota_atividades']
            if 'nota_recuperacao' in item:
                nota_obj.nota_recuperacao = item['nota_recuperacao']
            if 'faltas' in item:
                nota_obj.faltas = item['faltas']
                
            nota_obj.save()
            registros_atualizados += 1

        return Response({
            'sucesso': True,
            'mensagem': f'{registros_atualizados} notas do {bimestre}º bimestre publicadas com sucesso!',
            'turma_id': turma.id,
            'bimestre': bimestre,
        }, status=status.HTTP_200_OK)
