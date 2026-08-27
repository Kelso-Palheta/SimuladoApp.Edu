from django.test import TestCase
from datetime import date, time
from apps.autenticacao.models import Professor
from apps.diario.models import Turma
from apps.calendario.models import GradeHoraria, EmentaTema, EventoCalendario, AulaAgendada
from apps.calendario.services import SmartShiftService

class CalendarioSmartShiftTestCase(TestCase):
    def setUp(self):
        self.professor = Professor.objects.create_user(
            email='prof.calendario@escola.com.br',
            password='senha123',
            nome_completo='Prof. Carlos História'
        )
        self.turma = Turma.objects.create(
            professor=self.professor,
            nome='2º Ano C - História',
            ano_letivo=2026,
            disciplina='História',
            turno='matutino'
        )

        # Grade: toda terca-feira (dia 2) e quinta-feira (dia 4)
        GradeHoraria.objects.create(
            professor=self.professor,
            turma=self.turma,
            dia_semana=2, # Terça
            horario_inicio=time(7, 30),
            horario_fim=time(9, 10)
        )
        GradeHoraria.objects.create(
            professor=self.professor,
            turma=self.turma,
            dia_semana=4, # Quinta
            horario_inicio=time(7, 30),
            horario_fim=time(9, 10)
        )

        # Ementa
        self.tema1 = EmentaTema.objects.create(turma=self.turma, bimestre=1, ordem=1, titulo='Revolução Francesa: Antecedentes')
        self.tema2 = EmentaTema.objects.create(turma=self.turma, bimestre=1, ordem=2, titulo='A Queda da Bastilha')
        self.tema3 = EmentaTema.objects.create(turma=self.turma, bimestre=1, ordem=3, titulo='O Período do Terror')

    def test_smart_shift_desloca_aulas_em_cascata_pulando_feriados(self):
        # 1. Agenda aulas:
        # Terça 03/03/2026 -> Tema 1
        # Quinta 05/03/2026 -> Tema 2
        # Terça 10/03/2026 -> Tema 3
        d1 = date(2026, 3, 3) # Terça
        d2 = date(2026, 3, 5) # Quinta
        d3 = date(2026, 3, 10) # Terça

        a1 = AulaAgendada.objects.create(turma=self.turma, data=d1, horario_inicio=time(7, 30), horario_fim=time(9, 10), tema=self.tema1)
        a2 = AulaAgendada.objects.create(turma=self.turma, data=d2, horario_inicio=time(7, 30), horario_fim=time(9, 10), tema=self.tema2)
        a3 = AulaAgendada.objects.create(turma=self.turma, data=d3, horario_inicio=time(7, 30), horario_fim=time(9, 10), tema=self.tema3)

        # Cadastra um feriado na Quinta 05/03/2026
        EventoCalendario.objects.create(
            data=date(2026, 3, 5),
            titulo='Feriado Municipal',
            tipo='feriado',
            bloqueia_aulas=True
        )

        # Dispara Smart Shift para remanejar a partir de 03/03 (cancelamento de chuva)
        afetadas = SmartShiftService.remanejar_aulas_em_cascata(self.turma, d1, motivo='Chuva forte / Inundacao')
        self.assertEqual(afetadas, 3)

        a1.refresh_from_db()
        a2.refresh_from_db()
        a3.refresh_from_db()

        # A aula 1 deve ir para a proxima data disponivel (nao pode ser 05/03 porque e feriado, logo vai para terca 10/03)
        self.assertEqual(a1.data, date(2026, 3, 10))
        # A aula 2 deve ir para a quinta seguinte: 12/03/2026
        self.assertEqual(a2.data, date(2026, 3, 12))
        # A aula 3 deve ir para a terca seguinte: 17/03/2026
        self.assertEqual(a3.data, date(2026, 3, 17))
