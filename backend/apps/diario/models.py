import re
import unicodedata
from decimal import Decimal
from django.db import models
from apps.autenticacao.models import Professor

def normalizar_texto(texto):
    if not texto:
        return ""
    texto = unicodedata.normalize('NFD', str(texto))
    texto = re.sub(r'[\u0300-\u036f]', '', texto)
    return re.sub(r'[^a-zA-Z0-9\s]', '', texto).strip().lower()

def extrair_dois_primeiros_nomes(nome_completo):
    """Extrai os dois primeiros nomes significativos ignorando preposicoes."""
    preposicoes = {'de', 'da', 'do', 'dos', 'das', 'e'}
    partes = [p for p in normalizar_texto(nome_completo).split() if p and p not in preposicoes]
    if len(partes) >= 2:
        return partes[0] + partes[1]
    if len(partes) == 1:
        return partes[0]
    return "aluno"

class Turma(models.Model):
    TURNOS_CHOICES = [
        ('matutino', 'Matutino'),
        ('vespertino', 'Vespertino'),
        ('noturno', 'Noturno'),
        ('integral', 'Integral'),
    ]

    professor = models.ForeignKey(Professor, on_delete=models.CASCADE, related_name='turmas')
    nome = models.CharField('Nome da Turma', max_length=120)
    ano_letivo = models.PositiveIntegerField('Ano Letivo', default=2026)
    disciplina = models.CharField('Disciplina', max_length=120)
    turno = models.CharField('Turno', max_length=20, choices=TURNOS_CHOICES, default='matutino')
    
    # Configuracao pedagogica de pesos e media
    configuracao_pesos = models.JSONField(
        'Configuracao de Pesos e Media',
        default=dict,
        blank=True,
        help_text='Ex: {"peso_simulado": 4.0, "peso_atividades": 6.0, "media_aprovacao": 6.0}'
    )

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Turma'
        verbose_name_plural = 'Turmas'
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} ({self.disciplina}) — {self.professor.nome_completo or self.professor.email}"

    def save(self, *args, **kwargs):
        if not self.configuracao_pesos:
            self.configuracao_pesos = {
                "peso_simulado": 4.0,
                "peso_atividades": 6.0,
                "media_aprovacao": 6.0
            }
        super().save(*args, **kwargs)

class Estudante(models.Model):
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE, related_name='estudantes')
    nome = models.CharField('Nome do Estudante', max_length=255)
    data_nascimento = models.CharField('Data de Nascimento (DDMM)', max_length=10, blank=True)
    login_aluno = models.CharField('Login Unico do Aluno', max_length=100, db_index=True)
    numero_chamada = models.PositiveIntegerField('Numero de Chamada', default=1)
    ativo = models.BooleanField('Ativo', default=True)

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Estudante'
        verbose_name_plural = 'Estudantes'
        ordering = ['numero_chamada', 'nome']
        unique_together = [('turma', 'login_aluno')]

    def __str__(self):
        return f"{self.numero_chamada}. {self.nome} ({self.login_aluno})"

    def gerar_login_automatico(self):
        """Gera chave no padrao: 2 primeiros nomes significativos + DDMM."""
        dois_nomes = extrair_dois_primeiros_nomes(self.nome)
        nasc_limpo = re.sub(r'\D', '', str(self.data_nascimento or '1111'))
        if len(nasc_limpo) > 4:
            nasc_limpo = nasc_limpo[:4]  # Pega DDMM
        return f"{dois_nomes}{nasc_limpo}"

    def save(self, *args, **kwargs):
        if not self.login_aluno:
            self.login_aluno = self.gerar_login_automatico()
        super().save(*args, **kwargs)

class NotaBimestral(models.Model):
    STATUS_CHOICES = [
        ('em_curso', 'Em Curso'),
        ('aprovado', 'Aprovado'),
        ('recuperacao', 'Em Recuperacao'),
        ('critico', 'Risco Critico'),
    ]

    estudante = models.ForeignKey(Estudante, on_delete=models.CASCADE, related_name='notas')
    bimestre = models.PositiveSmallIntegerField('Bimestre', choices=[(1, '1º'), (2, '2º'), (3, '3º'), (4, '4º')])
    
    nota_simulado = models.DecimalField('Nota Simulado', max_digits=4, decimal_places=2, null=True, blank=True)
    nota_atividades = models.DecimalField('Nota Atividades', max_digits=4, decimal_places=2, null=True, blank=True)
    nota_recuperacao = models.DecimalField('Nota Recuperacao', max_digits=4, decimal_places=2, null=True, blank=True)
    media_final = models.DecimalField('Media Final Calculada', max_digits=4, decimal_places=2, null=True, blank=True)
    faltas = models.PositiveIntegerField('Faltas no Bimestre', default=0)
    status = models.CharField('Status Pedagogico', max_length=20, choices=STATUS_CHOICES, default='em_curso')

    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Nota Bimestral'
        verbose_name_plural = 'Notas Bimestrais'
        unique_together = [('estudante', 'bimestre')]
        ordering = ['bimestre']

    def __str__(self):
        return f"{self.estudante.nome} — {self.bimestre}º Bimestre: Média {self.media_final or '-'}"

    def calcular_media(self):
        """Calcula media ponderada com base nas configuracoes da turma."""
        cfg = self.estudante.turma.configuracao_pesos or {}
        p_sim = Decimal(str(cfg.get('peso_simulado', 4.0)))
        p_ativ = Decimal(str(cfg.get('peso_atividades', 6.0)))
        media_corte = Decimal(str(cfg.get('media_aprovacao', 6.0)))

        n_sim = self.nota_simulado if self.nota_simulado is not None else Decimal('0.0')
        n_ativ = self.nota_atividades if self.nota_atividades is not None else Decimal('0.0')

        soma_pesos = p_sim + p_ativ
        if soma_pesos > 0:
            media = (n_sim * p_sim + n_ativ * p_ativ) / soma_pesos
        else:
            media = (n_sim + n_ativ) / 2

        # Considera recuperacao se for maior
        if self.nota_recuperacao is not None and self.nota_recuperacao > media:
            media = self.nota_recuperacao

        self.media_final = round(media, 2)

        # Atualiza status pedagogico
        if self.media_final >= media_corte:
            self.status = 'aprovado'
        elif self.media_final >= media_corte - Decimal('2.0'):
            self.status = 'recuperacao'
        else:
            self.status = 'critico'

    def save(self, *args, **kwargs):
        self.calcular_media()
        super().save(*args, **kwargs)
