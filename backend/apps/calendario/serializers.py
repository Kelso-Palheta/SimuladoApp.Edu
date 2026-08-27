from rest_framework import serializers
from .models import GradeHoraria, EmentaTema, EventoCalendario, AulaAgendada

class GradeHorariaSerializer(serializers.ModelSerializer):
    dia_semana_nome = serializers.CharField(source='get_dia_semana_display', read_only=True)

    class Meta:
        model = GradeHoraria
        fields = ['id', 'turma', 'dia_semana', 'dia_semana_nome', 'horario_inicio', 'horario_fim', 'sala']

class EmentaTemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmentaTema
        fields = ['id', 'turma', 'bimestre', 'ordem', 'titulo', 'habilidade_bncc', 'objetivos']

class EventoCalendarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventoCalendario
        fields = ['id', 'data', 'titulo', 'tipo', 'bloqueia_aulas']

class AulaAgendadaSerializer(serializers.ModelSerializer):
    tema_detalhe = EmentaTemaSerializer(source='tema', read_only=True)

    class Meta:
        model = AulaAgendada
        fields = [
            'id',
            'turma',
            'data',
            'horario_inicio',
            'horario_fim',
            'tema',
            'tema_detalhe',
            'conteudo_customizado',
            'status',
            'motivo_remanejamento',
            'atualizado_em',
        ]
