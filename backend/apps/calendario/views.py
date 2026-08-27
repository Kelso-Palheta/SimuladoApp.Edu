from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from datetime import datetime
from apps.diario.models import Turma
from .models import GradeHoraria, EmentaTema, EventoCalendario, AulaAgendada
from .serializers import GradeHorariaSerializer, EmentaTemaSerializer, EventoCalendarioSerializer, AulaAgendadaSerializer
from .services import SmartShiftService

class GradeHorariaViewSet(viewsets.ModelViewSet):
    serializer_class = GradeHorariaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GradeHoraria.objects.filter(professor=self.request.user)

    def perform_create(self, serializer):
        serializer.save(professor=self.request.user)

class EmentaTemaViewSet(viewsets.ModelViewSet):
    serializer_class = EmentaTemaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        turma_id = self.request.query_params.get('turma_id')
        qs = EmentaTema.objects.filter(turma__professor=self.request.user)
        if turma_id:
            qs = qs.filter(turma_id=turma_id)
        return qs

class AulaAgendadaViewSet(viewsets.ModelViewSet):
    serializer_class = AulaAgendadaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        turma_id = self.request.query_params.get('turma_id')
        mes = self.request.query_params.get('mes')
        ano = self.request.query_params.get('ano')
        qs = AulaAgendada.objects.filter(turma__professor=self.request.user)
        if turma_id:
            qs = qs.filter(turma_id=turma_id)
        if mes and ano:
            qs = qs.filter(data__year=ano, data__month=mes)
        return qs

class SmartShiftView(APIView):
    """
    Endpoint para disparar o Smart Shift relacional.
    Recebe { turma_id, data_cancelada: "YYYY-MM-DD", motivo: "..." }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        turma_id = request.data.get('turma_id')
        data_str = request.data.get('data_cancelada')
        motivo = request.data.get('motivo', 'Remanejamento Solicitado')

        if not turma_id or not data_str:
            return Response({'erro': 'turma_id e data_cancelada sao obrigatorios.'}, status=status.HTTP_400_BAD_REQUEST)

        turma = get_object_or_404(Turma, id=turma_id, professor=request.user)
        try:
            data_cancelada = datetime.strptime(data_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'erro': 'Formato de data invalido. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        aulas_afetadas = SmartShiftService.remanejar_aulas_em_cascata(turma, data_cancelada, motivo)

        return Response({
            'sucesso': True,
            'mensagem': f'Smart Shift aplicado com sucesso! {aulas_afetadas} aulas foram remanejadas.',
            'aulas_afetadas': aulas_afetadas,
        })
