from django.contrib import admin
from .models import GradeHoraria, EmentaTema, EventoCalendario, AulaAgendada

@admin.register(GradeHoraria)
class GradeHorariaAdmin(admin.ModelAdmin):
    list_display = ('professor', 'turma', 'dia_semana', 'horario_inicio', 'horario_fim', 'sala')
    list_filter = ('dia_semana', 'turma')
    search_fields = ('professor__email', 'turma__nome')

@admin.register(EmentaTema)
class EmentaTemaAdmin(admin.ModelAdmin):
    list_display = ('turma', 'bimestre', 'ordem', 'titulo', 'habilidade_bncc')
    list_filter = ('bimestre', 'turma')
    search_fields = ('titulo', 'habilidade_bncc', 'turma__nome')

@admin.register(EventoCalendario)
class EventoCalendarioAdmin(admin.ModelAdmin):
    list_display = ('data', 'titulo', 'tipo', 'bloqueia_aulas', 'professor')
    list_filter = ('tipo', 'bloqueia_aulas')
    search_fields = ('titulo',)

@admin.register(AulaAgendada)
class AulaAgendadaAdmin(admin.ModelAdmin):
    list_display = ('data', 'turma', 'horario_inicio', 'tema', 'status')
    list_filter = ('status', 'data', 'turma')
    search_fields = ('turma__nome', 'conteudo_customizado')
