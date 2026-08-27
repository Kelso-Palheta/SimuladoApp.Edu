from django.db import models
from apps.autenticacao.models import Professor
from apps.diario.models import Turma, Estudante

class AtividadeBNCC(models.Model):
    DIFICULDADE_CHOICES = [
        ('facil', 'Fácil / Introdutória'),
        ('medio', 'Média / Consolidação'),
        ('dificil', 'Difícil / Aprofundamento'),
        ('enem_saeb', 'Padrão ENEM / SAEB'),
    ]

    professor = models.ForeignKey(Professor, on_delete=models.CASCADE, related_name='atividades_bncc')
    turma = models.ForeignKey(Turma, on_delete=models.SET_NULL, null=True, blank=True, related_name='atividades')
    titulo = models.CharField('Título da Atividade', max_length=255)
    disciplina = models.CharField('Disciplina', max_length=120)
    serie_ano = models.CharField('Série / Ano', max_length=50, default='Ensino Médio')
    bimestre = models.PositiveSmallIntegerField('Bimestre', choices=[(1, '1º'), (2, '2º'), (3, '3º'), (4, '4º')], default=1)
    habilidade_bncc_principal = models.CharField('Habilidade BNCC Principal', max_length=50, blank=True)
    nivel_dificuldade = models.CharField('Nível de Dificuldade', max_length=20, choices=DIFICULDADE_CHOICES, default='medio')
    publicada = models.BooleanField('Publicada para os Alunos', default=False)
    
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Atividade BNCC'
        verbose_name_plural = 'Atividades BNCC'
        ordering = ['-criado_em']

    def __str__(self):
        return f"{self.titulo} ({self.disciplina} - {self.habilidade_bncc_principal})"

    @property
    def total_questoes(self):
        return self.questoes.count()

class Questao(models.Model):
    TIPO_QUESTAO_CHOICES = [
        ('multipla_escolha', 'Múltipla Escolha (A, B, C, D)'),
        ('discursiva', 'Discursiva / Dissertativa'),
    ]

    atividade = models.ForeignKey(AtividadeBNCC, on_delete=models.CASCADE, related_name='questoes')
    ordem = models.PositiveIntegerField('Ordem da Questão', default=1)
    tipo = models.CharField('Tipo da Questão', max_length=30, choices=TIPO_QUESTAO_CHOICES, default='multipla_escolha')
    texto_base = models.TextField('Texto Motivador / Contexto', blank=True)
    enunciado = models.TextField('Enunciado da Questão')
    habilidade_bncc = models.CharField('Código da Habilidade BNCC', max_length=50, blank=True)
    
    # Alternativas: [{"letra": "A", "texto": "...", "correta": True, "justificativa": "..."}, ...]
    alternativas = models.JSONField('Alternativas e Justificativas', default=list, blank=True)
    
    # Rubrica de correção para discursivas
    rubrica_correcao = models.TextField('Critérios / Rubrica de Correção IA', blank=True)
    pontos = models.DecimalField('Pontuação da Questão', max_digits=4, decimal_places=2, default=1.0)

    class Meta:
        verbose_name = 'Questão'
        verbose_name_plural = 'Questões'
        ordering = ['ordem']

    def __str__(self):
        return f"Q{self.ordem} ({self.get_tipo_display()}) — {self.atividade.titulo}"

class RespostaEstudante(models.Model):
    questao = models.ForeignKey(Questao, on_delete=models.CASCADE, related_name='respostas')
    estudante = models.ForeignKey(Estudante, on_delete=models.CASCADE, related_name='respostas_atividades')
    resposta_aluno = models.TextField('Resposta Enviada pelo Aluno')
    correta = models.BooleanField('Correta', null=True, blank=True)
    nota_atribuida = models.DecimalField('Nota Atribuída', max_digits=4, decimal_places=2, null=True, blank=True)
    feedback_ia = models.TextField('Feedback Pedagógico da IA', blank=True)
    enviado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Resposta do Estudante'
        verbose_name_plural = 'Respostas dos Estudantes'
        unique_together = [('questao', 'estudante')]

    def __str__(self):
        return f"{self.estudante.nome} — Q{self.questao.ordem} ({self.questao.atividade.titulo})"
