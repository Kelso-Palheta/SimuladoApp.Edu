from django.test import TestCase
from decimal import Decimal
from apps.autenticacao.models import Professor, AssinaturaProfessor
from apps.diario.models import Turma, Estudante, NotaBimestral

class DiarioModelsTestCase(TestCase):
    def setUp(self):
        # Cria professor de teste
        self.professor = Professor.objects.create_user(
            email='prof.teste@escola.com.br',
            password='senhaSegura123',
            nome_completo='Professora Helena de Souza',
            disciplina_principal='Língua Portuguesa'
        )

        # Cria turma de teste
        self.turma = Turma.objects.create(
            professor=self.professor,
            nome='3º Ano A - Regular',
            ano_letivo=2026,
            disciplina='Língua Portuguesa',
            turno='matutino'
        )

    def test_desambiguacao_login_estudante_dois_nomes(self):
        """Verifica a regra de extracao de 2 primeiros nomes sem preposicoes + DDMM."""
        e1 = Estudante.objects.create(
            turma=self.turma,
            nome='Pedro Henrique Ribeiro Nascimento',
            data_nascimento='1111',
            numero_chamada=1
        )
        e2 = Estudante.objects.create(
            turma=self.turma,
            nome='Pedro Vitor Dos Santos Lima',
            data_nascimento='1111',
            numero_chamada=2
        )

        self.assertEqual(e1.login_aluno, 'pedrohenrique1111')
        self.assertEqual(e2.login_aluno, 'pedrovitor1111')

    def test_calculo_media_e_status_pedagogico(self):
        """Verifica se a media ponderada (40% simulado + 60% atividades) e calculada corretamente."""
        estudante = Estudante.objects.create(
            turma=self.turma,
            nome='Maria Eduarda Santos',
            data_nascimento='1505',
            numero_chamada=3
        )

        # Simulado = 8.0 (peso 4) e Atividades = 6.0 (peso 6) -> (32 + 36)/10 = 6.8
        nota = NotaBimestral.objects.create(
            estudante=estudante,
            bimestre=1,
            nota_simulado=Decimal('8.00'),
            nota_atividades=Decimal('6.00'),
            faltas=2
        )

        self.assertEqual(nota.media_final, Decimal('6.80'))
        self.assertEqual(nota.status, 'aprovado')

    def test_recuperacao_substitui_media_menor(self):
        """Verifica se nota de recuperacao sobrepoe a media se for superior."""
        estudante = Estudante.objects.create(
            turma=self.turma,
            nome='Lucas Oliveira',
            data_nascimento='2010',
            numero_chamada=4
        )

        # Simulado = 3.0, Atividades = 4.0 -> Media 3.60. Com Recuperacao 7.00 -> Media Final 7.00
        nota = NotaBimestral.objects.create(
            estudante=estudante,
            bimestre=1,
            nota_simulado=Decimal('3.00'),
            nota_atividades=Decimal('4.00'),
            nota_recuperacao=Decimal('7.00'),
            faltas=0
        )

        self.assertEqual(nota.media_final, Decimal('7.00'))
        self.assertEqual(nota.status, 'aprovado')
