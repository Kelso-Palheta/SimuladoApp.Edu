from django.db import models
from apps.autenticacao.models import Professor
from apps.diario.models import Turma

class GradeHoraria(models.Model):
    DIAS_SEMANA_CHOICES = [
        (1, 'Segunda-feira'),
        (2, 'Terça-feira'),
        (3, 'Quarta-feira'),
        (4, 'Quinta-feira'),
        (5, 'Sexta-feira'),
        (6, 'Sábado'),
    ]

    professor = models.ForeignKey(Professor, on_delete=models.CASCADE, related_name='grades_horarias')
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE, related_name='grades')
    dia_semana = models.PositiveSmallIntegerField('Dia da Semana', choices=DIAS_SEMANA_CHOICES)
    horario_inicio = models.TimeField('Horário de Início')
    horario_fim = models.TimeField('Horário de Término')
    sala = models.CharField('Sala de Aula', max_length=50, blank=True)

    class Meta:
        verbose_name = 'Grade Horária'
        verbose_name_plural = 'Grades Horárias'
        ordering = ['dia_semana', 'horario_inicio']

    def __str__(self):
        return f"{self.get_dia_semana_display()} ({self.horario_inicio} - {self.horario_fim}) — {self.turma.nome}"

class EmentaTema(models.Model):
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE, related_name='temas_ementa')
    bimestre = models.PositiveSmallIntegerField('Bimestre', choices=[(1, '1º'), (2, '2º'), (3, '3º'), (4, '4º')])
    ordem = models.PositiveIntegerField('Ordem Cronológica na Ementa', default=1)
    titulo = models.CharField('Título do Tema / Aula', max_length=255)
    habilidade_bncc = models.CharField('Código da Habilidade BNCC', max_length=50, blank=True)
    objetivos = models.TextField('Objetivos de Aprendizagem', blank=True)

    class Meta:
        verbose_name = 'Tema da Ementa'
        verbose_name_plural = 'Temas da Ementa'
        ordering = ['bimestre', 'ordem']

    def __str__(self):
        return f"{self.bimestre}º Bim - {self.ordem}º: {self.titulo} ({self.turma.nome})"

class EventoCalendario(models.Model):
    TIPOS_EVENTO_CHOICES = [
        ('feriado', 'Feriado Nacional / Municipal'),
        ('recesso', 'Recesso Escolar'),
        ('conselho_classe', 'Conselho de Classe'),
        ('planejamento', 'Dia de Planejamento Pedagógico'),
        ('evento_escolar', 'Evento / Feira Cultural'),
    ]

    professor = models.ForeignKey(Professor, on_delete=models.CASCADE, null=True, blank=True, related_name='eventos_calendario')
    data = models.DateField('Data do Evento', db_index=True)
    titulo = models.CharField('Título do Evento', max_length=200)
    tipo = models.CharField('Tipo do Evento', max_length=30, choices=TIPOS_EVENTO_CHOICES, default='feriado')
    bloqueia_aulas = models.BooleanField('Bloqueia Agendamento de Aulas', default=True)

    class Meta:
        verbose_name = 'Evento do Calendário'
        verbose_name_plural = 'Eventos do Calendário'
        ordering = ['data']

    def __str__(self):
        return f"{self.data.strftime('%d/%m/%Y')} — {self.titulo} ({self.get_tipo_display()})"

class AulaAgendada(models.Model):
    STATUS_AULA_CHOICES = [
        ('prevista', 'Prevista'),
        ('lecionada', 'Lecionada com Sucesso'),
        ('remanejada', 'Remanejada (Smart Shift)'),
        ('cancelada', 'Cancelada'),
        ('feriado', 'Feriado / Recesso'),
    ]

    turma = models.ForeignKey(Turma, on_delete=models.CASCADE, related_name='aulas')
    data = models.DateField('Data da Aula', db_index=True)
    horario_inicio = models.TimeField('Horário de Início')
    horario_fim = models.TimeField('Horário de Término')
    tema = models.ForeignKey(EmentaTema, on_delete=models.SET_NULL, null=True, blank=True, related_name='aulas_agendadas')
    conteudo_customizado = models.CharField('Conteúdo Customizado', max_length=255, blank=True)
    status = models.CharField('Status da Aula', max_length=20, choices=STATUS_AULA_CHOICES, default='prevista')
    motivo_remanejamento = models.CharField('Motivo de Alteração', max_length=255, blank=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Aula Agendada'
        verbose_name_plural = 'Aulas Agendadas'
        ordering = ['data', 'horario_inicio']

    def __str__(self):
        tema_nome = self.tema.titulo if self.tema else (self.conteudo_customizado or "Aula Regular")
        return f"{self.data.strftime('%d/%m/%Y')} — {self.turma.nome}: {tema_nome} ({self.get_status_display()})"
