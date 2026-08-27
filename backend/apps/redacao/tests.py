from django.test import TestCase
from apps.autenticacao.models import Professor
from apps.diario.models import Turma, Estudante
from apps.redacao.models import TemaRedacao, SubmissaoRedacao
from apps.redacao.tasks import processar_redacao_opencv_task

class RedacaoPipelineTestCase(TestCase):
    def setUp(self):
        self.professor = Professor.objects.create_user(
            email='prof.redacao.enem@escola.com.br',
            password='senha123',
            nome_completo='Prof. Marcelo Redação Nota 1000'
        )
        self.turma = Turma.objects.create(
            professor=self.professor,
            nome='3º Ano Terceirão',
            ano_letivo=2026,
            disciplina='Redação ENEM'
        )
        self.estudante = Estudante.objects.create(
            turma=self.turma,
            nome='Mariana Albuquerque',
            data_nascimento='2204',
            numero_chamada=12
        )
        self.tema = TemaRedacao.objects.create(
            titulo='Desafios para a valorização de comunidades e povos tradicionais no Brasil',
            ano_enem=2022
        )

    def test_calculo_nota_total_competencias(self):
        submissao = SubmissaoRedacao.objects.create(
            professor=self.professor,
            estudante=self.estudante,
            tema=self.tema,
            nota_c1=160,
            nota_c2=200,
            nota_c3=160,
            nota_c4=160,
            nota_c5=200
        )
        self.assertEqual(submissao.nota_total, 880)

    def test_limite_maximo_200_por_competencia(self):
        submissao = SubmissaoRedacao.objects.create(
            professor=self.professor,
            estudante=self.estudante,
            tema=self.tema,
            nota_c1=250, # Deve limitar a 200
            nota_c2=200,
            nota_c3=200,
            nota_c4=200,
            nota_c5=200
        )
        self.assertEqual(submissao.nota_total, 1000)

    def test_execucao_task_celery_processamento(self):
        submissao = SubmissaoRedacao.objects.create(
            professor=self.professor,
            estudante=self.estudante,
            tema=self.tema,
            texto_extraido_ocr="O filósofo Zygmunt Bauman, em sua obra Modernidade Líquida..."
        )
        resultado = processar_redacao_opencv_task(submissao.id)
        self.assertTrue(resultado['sucesso'])

        submissao.refresh_from_db()
        self.assertEqual(submissao.status, 'concluida')
        self.assertGreaterEqual(submissao.nota_total, 800)
        self.assertIn("pontos_fortes", submissao.laudo_pedagogico)
