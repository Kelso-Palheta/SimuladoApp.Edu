from django.contrib import admin
from .models import AtividadeBNCC, Questao, RespostaEstudante

class QuestaoInline(admin.StackedInline):
    model = Questao
    extra = 0
    fields = ('ordem', 'tipo', 'enunciado', 'habilidade_bncc', 'alternativas', 'rubrica_correcao', 'pontos')

@admin.register(AtividadeBNCC)
class AtividadeBNCCAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'disciplina', 'habilidade_bncc_principal', 'nivel_dificuldade', 'professor', 'publicada', 'criado_em')
    list_filter = ('disciplina', 'nivel_dificuldade', 'publicada', 'bimestre')
    search_fields = ('titulo', 'habilidade_bncc_principal', 'professor__email')
    inlines = [QuestaoInline]

@admin.register(Questao)
class QuestaoAdmin(admin.ModelAdmin):
    list_display = ('atividade', 'ordem', 'tipo', 'habilidade_bncc', 'pontos')
    list_filter = ('tipo', 'atividade__disciplina')
    search_fields = ('enunciado', 'habilidade_bncc')

@admin.register(RespostaEstudante)
class RespostaEstudanteAdmin(admin.ModelAdmin):
    list_display = ('estudante', 'questao', 'correta', 'nota_atribuida', 'enviado_em')
    list_filter = ('correta', 'questao__atividade')
    search_fields = ('estudante__nome', 'resposta_aluno')
