from rest_framework import serializers
from .models import Professor, AssinaturaProfessor

class AssinaturaSerializer(serializers.ModelSerializer):
    saldo_disponivel = serializers.ReadOnlyField()

    class Meta:
        model = AssinaturaProfessor
        fields = [
            'tipo_plano',
            'creditos_mensais_total',
            'creditos_utilizados_mes',
            'creditos_avulsos_extras',
            'saldo_disponivel',
            'data_renovacao_ciclo',
            'assinatura_ativa',
            'tem_acesso_diario',
            'tem_acesso_calendario',
            'tem_acesso_atividades',
            'tem_acesso_redacao',
            'tem_acesso_agentes',
            'tem_acesso_analytics',
            'tem_acesso_gamificacao',
        ]

class ProfessorSerializer(serializers.ModelSerializer):
    assinatura = AssinaturaSerializer(read_only=True)

    class Meta:
        model = Professor
        fields = [
            'id',
            'email',
            'nome_completo',
            'escola',
            'disciplina_principal',
            'avatar_url',
            'data_cadastro',
            'assinatura',
        ]
        read_only_fields = ['id', 'data_cadastro']

class RegistroProfessorSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = Professor
        fields = ['email', 'password', 'nome_completo', 'escola', 'disciplina_principal']

    def create(self, validated_data):
        return Professor.objects.create_user(**validated_data)
