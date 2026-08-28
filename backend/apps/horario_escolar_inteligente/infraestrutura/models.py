"""
Modelos Django ORM (src/infraestrutura/models.py)
Esquema relacional em conformidade com specs/DATABASE_SCHEMA.md
"""
from django.db import models


class EscolaModel(models.Model):
    """Representa uma instituição de ensino (tenant)."""
    nome = models.CharField(max_length=200, verbose_name="Nome da Escola")
    codigo_mec = models.CharField(max_length=50, blank=True, null=True, verbose_name="Código MEC/INEP")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")

    class Meta:
        db_table = "escolas"
        verbose_name = "Escola"
        verbose_name_plural = "Escolas"

    def __str__(self):
        return self.nome


class TurmaModel(models.Model):
    """Representa uma turma de alunos."""
    escola = models.ForeignKey(EscolaModel, on_delete=models.CASCADE, related_name="turmas")
    nome = models.CharField(max_length=100, verbose_name="Nome da Turma (ex: 1º ANO - 101)")
    serie = models.CharField(max_length=50, verbose_name="Série/Ano")
    total_aulas_semana = models.IntegerField(default=45, verbose_name="Total de Aulas Semanais")

    class Meta:
        db_table = "turmas"
        verbose_name = "Turma"
        verbose_name_plural = "Turmas"
        unique_together = ("escola", "nome")

    def __str__(self):
        return f"{self.nome} ({self.escola.nome})"


class ProfessorModel(models.Model):
    """Representa um docente com vínculos de área BNCC e dia de planejamento."""
    escola = models.ForeignKey(EscolaModel, on_delete=models.CASCADE, related_name="professores")
    nome = models.CharField(max_length=150, verbose_name="Nome do Professor")
    area_bncc = models.CharField(
        max_length=50,
        choices=[
            ("Linguagens", "Linguagens e suas Tecnologias"),
            ("Matemática", "Matemática e suas Tecnologias"),
            ("Natureza", "Ciências da Natureza e suas Tecnologias"),
            ("Humanas", "Ciências Humanas e Sociais Aplicadas"),
            ("Especiais", "Espaços Especiais / Diversificada"),
        ],
        verbose_name="Área BNCC"
    )
    dia_planejamento = models.CharField(max_length=30, blank=True, null=True, verbose_name="Dia de Planejamento (Folga)")
    turno_planejamento = models.CharField(max_length=30, blank=True, null=True, verbose_name="Turno de Planejamento")

    class Meta:
        db_table = "professores"
        verbose_name = "Professor"
        verbose_name_plural = "Professores"
        unique_together = ("escola", "nome")

    def __str__(self):
        return f"{self.nome} ({self.area_bncc})"


class SalaTematicaModel(models.Model):
    """Representa uma sala-ambiente temática por área de conhecimento."""
    escola = models.ForeignKey(EscolaModel, on_delete=models.CASCADE, related_name="salas_tematicas")
    nome = models.CharField(max_length=100, verbose_name="Nome da Sala (ex: Sala L1)")
    area_bncc = models.CharField(max_length=50, verbose_name="Área BNCC Vinculada")
    tipologia = models.CharField(max_length=50, default="Teórica", verbose_name="Tipologia (Teórica, Prática, Lab)")
    capacidade = models.IntegerField(default=40, verbose_name="Capacidade de Alunos")

    class Meta:
        db_table = "salas_tematicas"
        verbose_name = "Sala Temática"
        verbose_name_plural = "Salas Temáticas"
        unique_together = ("escola", "nome")

    def __str__(self):
        return f"{self.nome} - {self.area_bncc}"


class MatrizCurricularModel(models.Model):
    """Carga horária semanal por disciplina para cada turma."""
    turma = models.ForeignKey(TurmaModel, on_delete=models.CASCADE, related_name="matrizes")
    disciplina = models.CharField(max_length=100, verbose_name="Disciplina")
    carga_semanal = models.IntegerField(verbose_name="Carga Horária Semanal (aulas)")

    class Meta:
        db_table = "matrizes_curriculares"
        verbose_name = "Matriz Curricular"
        verbose_name_plural = "Matrizes Curriculares"
        unique_together = ("turma", "disciplina")

    def __str__(self):
        return f"{self.turma.nome} - {self.disciplina}: {self.carga_semanal}h"


class GradeModel(models.Model):
    """Grade escolar semanal com histórico e versionamento."""
    escola = models.ForeignKey(EscolaModel, on_delete=models.CASCADE, related_name="grades")
    versao = models.CharField(max_length=50, default="1.0.0", verbose_name="Versão da Grade")
    ativa = models.BooleanField(default=True, verbose_name="Grade Vigente")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Data de Criação")

    class Meta:
        db_table = "grades"
        verbose_name = "Grade Escolar"
        verbose_name_plural = "Grades Escolares"

    def __str__(self):
        return f"Grade {self.versao} - {self.escola.nome}"


class SlotGradeModel(models.Model):
    """Slot individual de alocação de aula (Turma x Professor x Sala x Tempo)."""
    grade = models.ForeignKey(GradeModel, on_delete=models.CASCADE, related_name="slots")
    dia = models.CharField(max_length=30, verbose_name="Dia da Semana")
    aula = models.IntegerField(verbose_name="Tempo de Aula (1 a 9)")
    turma = models.ForeignKey(TurmaModel, on_delete=models.CASCADE, related_name="slots_alocados")
    professor = models.ForeignKey(ProfessorModel, on_delete=models.CASCADE, related_name="slots_alocados")
    disciplina = models.CharField(max_length=100, verbose_name="Disciplina")
    sala = models.ForeignKey(SalaTematicaModel, on_delete=models.CASCADE, related_name="slots_alocados")

    class Meta:
        db_table = "slots_grade"
        verbose_name = "Slot de Grade"
        verbose_name_plural = "Slots de Grade"
        indexes = [
            models.Index(fields=["professor", "dia", "aula"], name="idx_slot_prof_dia_aula"),
            models.Index(fields=["sala", "dia", "aula"], name="idx_slot_sala_dia_aula"),
            models.Index(fields=["turma", "dia", "aula"], name="idx_slot_turma_dia_aula"),
            models.Index(fields=["grade"], name="idx_slot_grade"),
        ]

    def __str__(self):
        return f"{self.turma.nome} | {self.dia} A{self.aula}: {self.disciplina} ({self.professor.nome} @ {self.sala.nome})"


class ChangelogPermutaModel(models.Model):
    """Auditoria cronológica de remanejamentos e alterações na grade."""
    grade = models.ForeignKey(GradeModel, on_delete=models.CASCADE, related_name="changelogs")
    data_hora = models.DateTimeField(auto_now_add=True, verbose_name="Data/Hora da Operação")
    tipo_operacao = models.CharField(max_length=50, default="Permuta", verbose_name="Tipo de Operação")
    descricao = models.TextField(verbose_name="Descrição Detalhada do Remanejamento")

    class Meta:
        db_table = "changelog_permutas"
        verbose_name = "Changelog de Permuta"
        verbose_name_plural = "Changelogs de Permutas"

    def __str__(self):
        return f"[{self.data_hora.strftime('%d/%m %H:%M')}] {self.tipo_operacao}: {self.descricao[:50]}"
