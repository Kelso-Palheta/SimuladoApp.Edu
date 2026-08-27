from django.db import models
from apps.autenticacao.models import Professor
from apps.diario.models import Estudante

class TemaRedacao(models.Model):
    professor = models.ForeignKey(Professor, on_delete=models.SET_NULL, null=True, blank=True, related_name='temas_redacao')
    titulo = models.CharField('Frase-Tema Oficial', max_length=255)
    ano_enem = models.PositiveIntegerField('Ano do ENEM (se aplicável)', null=True, blank=True)
    textos_motivadores = models.JSONField('Textos Motivadores', default=list, blank=True)
    orientacoes = models.TextField('Orientações e Instruções', blank=True)
    ativo = models.BooleanField('Ativo', default=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Tema de Redação'
        verbose_name_plural = 'Temas de Redação'
        ordering = ['-ano_enem', '-criado_em']

    def __str__(self):
        ano_str = f" ({self.ano_enem})" if self.ano_enem else ""
        return f"{self.titulo}{ano_str}"

class SubmissaoRedacao(models.Model):
    STATUS_CHOICES = [
        ('pendente', 'Pendente na Fila Celery'),
        ('processando_ocr', 'Processando OpenCV & OCR'),
        ('avaliando_ia', 'Avaliando Competências com IA'),
        ('concluida', 'Correção Concluída'),
        ('erro', 'Erro no Processamento'),
    ]

    professor = models.ForeignKey(Professor, on_delete=models.CASCADE, related_name='redacoes_corrigidas')
    estudante = models.ForeignKey(Estudante, on_delete=models.SET_NULL, null=True, blank=True, related_name='redacoes')
    nome_aluno_avulso = models.CharField('Nome do Aluno (se avulso)', max_length=255, blank=True)
    tema = models.ForeignKey(TemaRedacao, on_delete=models.SET_NULL, null=True, blank=True, related_name='submissoes')
    
    # Imagem e OCR
    imagem_url = models.URLField('URL da Imagem da Folha', max_length=500, blank=True)
    texto_extraido_ocr = models.TextField('Texto Extraído via OCR', blank=True)

    # 5 Competências do ENEM (0 a 200)
    nota_c1 = models.PositiveSmallIntegerField('C1 - Norma Culta', default=0)
    nota_c2 = models.PositiveSmallIntegerField('C2 - Tema e Repertório', default=0)
    nota_c3 = models.PositiveSmallIntegerField('C3 - Projeto de Texto', default=0)
    nota_c4 = models.PositiveSmallIntegerField('C4 - Coesão e Conectivos', default=0)
    nota_c5 = models.PositiveSmallIntegerField('C5 - Proposta de Intervenção', default=0)
    nota_total = models.PositiveSmallIntegerField('Nota Final (0 a 1000)', default=0)

    # Laudo pedagógico detalhado
    laudo_pedagogico = models.JSONField('Laudo de Avaliação IA', default=dict, blank=True)
    
    status = models.CharField('Status do Processamento', max_length=30, choices=STATUS_CHOICES, default='pendente')
    erro_detalhe = models.TextField('Detalhes do Erro', blank=True)
    tempo_processamento_ms = models.PositiveIntegerField('Tempo de Processamento (ms)', default=0)

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Submissão de Redação'
        verbose_name_plural = 'Submissões de Redações'
        ordering = ['-criado_em']

    def __str__(self):
        aluno_nome = self.estudante.nome if self.estudante else (self.nome_aluno_avulso or "Aluno")
        return f"{aluno_nome} — Nota: {self.nota_total}/1000 ({self.get_status_display()})"

    def calcular_nota_total(self):
        """Calcula soma das 5 competencias limitando cada uma a 200 pontos."""
        c1 = min(200, max(0, self.nota_c1))
        c2 = min(200, max(0, self.nota_c2))
        c3 = min(200, max(0, self.nota_c3))
        c4 = min(200, max(0, self.nota_c4))
        c5 = min(200, max(0, self.nota_c5))
        self.nota_total = c1 + c2 + c3 + c4 + c5

    def save(self, *args, **kwargs):
        self.calcular_nota_total()
        super().save(*args, **kwargs)
