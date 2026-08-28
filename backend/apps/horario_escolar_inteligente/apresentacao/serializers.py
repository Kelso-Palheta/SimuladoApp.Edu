"""
Serializers do Django REST Framework (src/apresentacao/serializers.py)
Validação de entrada e serialização de saída da API REST
"""
from rest_framework import serializers


class SlotSerializer(serializers.Serializer):
    dia = serializers.CharField(max_length=30)
    aula = serializers.IntegerField(min_value=1, max_value=9)
    turma = serializers.CharField(max_length=100)
    prof = serializers.CharField(max_length=100)
    disc = serializers.CharField(max_length=100)
    sala = serializers.CharField(max_length=100)


class ValidarGradeRequestSerializer(serializers.Serializer):
    escola_id = serializers.CharField(required=False, default="default")
    slots = SlotSerializer(many=True)


class PosicaoSlotSerializer(serializers.Serializer):
    dia = serializers.CharField(max_length=30)
    aula = serializers.IntegerField(min_value=1, max_value=9)
    turma = serializers.CharField(max_length=100)


class RemanejarAulaRequestSerializer(serializers.Serializer):
    escola_id = serializers.CharField(required=False, default="default")
    origem = PosicaoSlotSerializer()
    destino = PosicaoSlotSerializer()
    forcar_se_invalido = serializers.BooleanField(required=False, default=False)


class ImportarPDFRequestSerializer(serializers.Serializer):
    arquivo_pdf = serializers.FileField(required=True)


class AssistenteIARequestSerializer(serializers.Serializer):
    mensagem_usuario = serializers.CharField(required=True)
    prompt_sistema = serializers.CharField(required=False, default="Você é um coordenador pedagógico especialista em horários escolares.")
    contexto = serializers.DictField(required=False, default=dict)
