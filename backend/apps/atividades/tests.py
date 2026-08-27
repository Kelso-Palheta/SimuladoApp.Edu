from django.test import TestCase
from decimal import Decimal
from apps.autenticacao.models import Professor
from apps.diario.models import Turma, Estudante
from apps.atividades.models import AtividadeBNCC, Questao, RespostaEstudante

class AtividadesBNCCTestCase(TestCase):
    def setUp(self):
        self.professor = Professor.objects.create_user(
            email='prof.portugues@escola.com.br',
            password='senha123',
            nome_completo='Profa. Lúcia Língua Portuguesa'
        )
        self.turma = Turma.objects.create(
            professor=self.professor,
            nome='1º Ano A',
            ano_letivo=2026,
            disciplina='Língua Portuguesa'
        )
        self.estudante = Estudante.objects.create(
            turma=self.turma,
            nome='Ana Clara Mendes',
            data_nascimento='0808',
            numero_chamada=1
        )

    def test_criacao_atividade_com_questoes_bncc(self):
        atividade = AtividadeBNCC.objects.create(
            professor=self.professor,
            turma=self.turma,
            titulo='Interpretação de Texto e Figuras de Linguagem',
            disciplina='Língua Portuguesa',
            serie_ano='1º Ano EM',
            habilidade_bncc_principal='EM13LP01',
            nivel_dificuldade='enem_saeb'
        )

        q1 = Questao.objects.create(
            atividade=atividade,
            ordem=1,
            tipo='multipla_escolha',
            enunciado='Qual figura de linguagem predomina no verso destacado?',
            habilidade_bncc='EM13LP01',
            alternativas=[
                {"letra": "A", "texto": "Metáfora", "correta": True, "justificativa": "Compara dois elementos implicitamente."},
                {"letra": "B", "texto": "Metonímia", "correta": False, "justificativa": "Troca de parte pelo todo."},
                {"letra": "C", "texto": "Pleonasmo", "correta": False, "justificativa": "Redundância."},
                {"letra": "D", "texto": "Antítese", "correta": False, "justificativa": "Ideias opostas."}
            ],
            pontos=Decimal('1.00')
        )

        self.assertEqual(atividade.total_questoes, 1)
        self.assertEqual(q1.alternativas[0]['letra'], 'A')
        self.assertTrue(q1.alternativas[0]['correta'])

    def test_resposta_aluno_multipla_escolha(self):
        atividade = AtividadeBNCC.objects.create(
            professor=self.professor,
            titulo='Quiz Rápido',
            disciplina='Língua Portuguesa'
        )
        q1 = Questao.objects.create(
            atividade=atividade,
            ordem=1,
            tipo='multipla_escolha',
            enunciado='Assinale a alternativa correta.',
            alternativas=[
                {"letra": "A", "texto": "Opção A", "correta": True},
                {"letra": "B", "texto": "Opção B", "correta": False}
            ]
        )

        resposta = RespostaEstudante.objects.create(
            questao=q1,
            estudante=self.estudante,
            resposta_aluno='A',
            correta=True,
            nota_atribuida=Decimal('1.00')
        )

        self.assertTrue(resposta.correta)
        self.assertEqual(resposta.nota_atribuida, Decimal('1.00'))
