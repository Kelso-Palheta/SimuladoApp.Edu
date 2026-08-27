from rest_framework import serializers
from .models import Turma, Estudante, NotaBimestral

class NotaBimestralSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotaBimestral
        fields = [
            'id',
            'bimestre',
            'nota_simulado',
            'nota_atividades',
            'nota_recuperacao',
            'media_final',
            'faltas',
            'status',
            'atualizado_em',
        ]
        read_only_fields = ['id', 'media_final', 'status', 'atualizado_em']

class EstudanteSerializer(serializers.ModelSerializer):
    notas = NotaBimestralSerializer(many=True, read_only=True)

    class Meta:
        model = Estudante
        fields = [
            'id',
            'turma',
            'nome',
            'data_nascimento',
            'login_aluno',
            'numero_chamada',
            'ativo',
            'notas',
        ]
        read_only_fields = ['id', 'login_aluno']

class TurmaSerializer(serializers.ModelSerializer):
    total_estudantes = serializers.SerializerMethodField()

    class Meta:
        model = Turma
        fields = [
            'id',
            'nome',
            'ano_letivo',
            'disciplina',
            'turno',
            'configuracao_pesos',
            'total_estudantes',
            'criado_em',
            'atualizado_em',
        ]
        read_only_fields = ['id', 'criado_em', 'atualizado_em']

    def get_total_estudantes(self, obj):
        return obj.estudantes.filter(ativo=True).count()
