from django.contrib import admin
from .models import Turma, Estudante, NotaBimestral

class EstudanteInline(admin.TabularInline):
    model = Estudante
    extra = 0
    fields = ('numero_chamada', 'nome', 'data_nascimento', 'login_aluno', 'ativo')
    readonly_fields = ('login_aluno',)

class NotaBimestralInline(admin.TabularInline):
    model = NotaBimestral
    extra = 0
    fields = ('bimestre', 'nota_simulado', 'nota_atividades', 'nota_recuperacao', 'media_final', 'faltas', 'status')
    readonly_fields = ('media_final', 'status')

@admin.register(Turma)
class TurmaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'disciplina', 'professor', 'ano_letivo', 'turno', 'get_total_alunos')
    list_filter = ('ano_letivo', 'turno', 'disciplina')
    search_fields = ('nome', 'disciplina', 'professor__email', 'professor__nome_completo')
    inlines = [EstudanteInline]

    def get_total_alunos(self, obj):
        return obj.estudantes.count()
    get_total_alunos.short_description = 'Total Alunos'

@admin.register(Estudante)
class EstudanteAdmin(admin.ModelAdmin):
    list_display = ('numero_chamada', 'nome', 'turma', 'login_aluno', 'data_nascimento', 'ativo')
    list_filter = ('turma__ano_letivo', 'turma', 'ativo')
    search_fields = ('nome', 'login_aluno', 'turma__nome')
    inlines = [NotaBimestralInline]

@admin.register(NotaBimestral)
class NotaBimestralAdmin(admin.ModelAdmin):
    list_display = ('estudante', 'get_turma', 'bimestre', 'nota_simulado', 'nota_atividades', 'media_final', 'status')
    list_filter = ('bimestre', 'status', 'estudante__turma')
    search_fields = ('estudante__nome', 'estudante__login_aluno')

    def get_turma(self, obj):
        return obj.estudante.turma.nome
    get_turma.short_description = 'Turma'
