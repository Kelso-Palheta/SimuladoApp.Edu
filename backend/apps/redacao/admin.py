from django.contrib import admin
from .models import TemaRedacao, SubmissaoRedacao

@admin.register(TemaRedacao)
class TemaRedacaoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'ano_enem', 'professor', 'ativo', 'criado_em')
    list_filter = ('ano_enem', 'ativo')
    search_fields = ('titulo', 'orientacoes')

@admin.register(SubmissaoRedacao)
class SubmissaoRedacaoAdmin(admin.ModelAdmin):
    list_display = ('get_aluno', 'tema', 'professor', 'nota_total', 'status', 'tempo_processamento_ms', 'criado_em')
    list_filter = ('status', 'tema')
    search_fields = ('estudante__nome', 'nome_aluno_avulso', 'texto_extraido_ocr')

    def get_aluno(self, obj):
        return obj.estudante.nome if obj.estudante else (obj.nome_aluno_avulso or "Aluno Avulso")
    get_aluno.short_description = 'Aluno'
