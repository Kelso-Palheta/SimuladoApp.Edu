from rest_framework import serializers
from .models import AtividadeBNCC, Questao, RespostaEstudante

class QuestaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Questao
        fields = [
            'id',
            'ordem',
            'tipo',
            'texto_base',
            'enunciado',
            'habilidade_bncc',
            'alternativas',
            'rubrica_correcao',
            'pontos',
        ]

class AtividadeBNCCSerializer(serializers.ModelSerializer):
    questoes = QuestaoSerializer(many=True, required=False)
    total_questoes = serializers.ReadOnlyField()

    class Meta:
        model = AtividadeBNCC
        fields = [
            'id',
            'turma',
            'titulo',
            'disciplina',
            'serie_ano',
            'bimestre',
            'habilidade_bncc_principal',
            'nivel_dificuldade',
            'publicada',
            'total_questoes',
            'questoes',
            'criado_em',
            'atualizado_em',
        ]
        read_only_fields = ['id', 'criado_em', 'atualizado_em']

    def create(self, validated_data):
        questoes_data = validated_data.pop('questoes', [])
        atividade = AtividadeBNCC.objects.create(**validated_data)
        for idx, q_data in enumerate(questoes_data, start=1):
            Questao.objects.create(atividade=atividade, ordem=q_data.get('ordem', idx), **q_data)
        return atividade

class RespostaEstudanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RespostaEstudante
        fields = [
            'id',
            'questao',
            'estudante',
            'resposta_aluno',
            'correta',
            'nota_atribuida',
            'feedback_ia',
            'enviado_em',
        ]
        read_only_fields = ['id', 'enviado_em']
