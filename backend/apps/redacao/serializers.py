from rest_framework import serializers
from .models import TemaRedacao, SubmissaoRedacao

class TemaRedacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemaRedacao
        fields = ['id', 'titulo', 'ano_enem', 'textos_motivadores', 'orientacoes', 'ativo', 'criado_em']

class SubmissaoRedacaoSerializer(serializers.ModelSerializer):
    tema_titulo = serializers.CharField(source='tema.titulo', read_only=True)
    aluno_nome = serializers.SerializerMethodField()

    class Meta:
        model = SubmissaoRedacao
        fields = [
            'id',
            'estudante',
            'aluno_nome',
            'nome_aluno_avulso',
            'tema',
            'tema_titulo',
            'imagem_url',
            'texto_extraido_ocr',
            'nota_c1',
            'nota_c2',
            'nota_c3',
            'nota_c4',
            'nota_c5',
            'nota_total',
            'laudo_pedagogico',
            'status',
            'erro_detalhe',
            'tempo_processamento_ms',
            'criado_em',
            'atualizado_em',
        ]
        read_only_fields = ['id', 'nota_total', 'status', 'tempo_processamento_ms', 'criado_em', 'atualizado_em']

    def get_aluno_nome(self, obj):
        return obj.estudante.nome if obj.estudante else (obj.nome_aluno_avulso or "Aluno Avulso")
