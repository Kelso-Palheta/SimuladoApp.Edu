from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
from datetime import timedelta
from rest_framework.exceptions import PermissionDenied

class ProfessorManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('O email e obrigatorio.')
        email = self.normalize_email(email)
        username = extra_fields.pop('username', None) or email
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        
        # Cria assinatura padrao gratuita automaticamente
        AssinaturaProfessor.objects.get_or_create(
            professor=user,
            defaults={
                'tipo_plano': 'gratuito',
                'creditos_mensais_total': 0,
                'data_renovacao_ciclo': timezone.now().date() + timedelta(days=30),
                'assinatura_ativa': True
            }
        )
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class Professor(AbstractUser):
    email = models.EmailField('E-mail', unique=True)
    nome_completo = models.CharField('Nome Completo', max_length=255, blank=True)
    escola = models.CharField('Escola Principal', max_length=255, blank=True)
    disciplina_principal = models.CharField('Disciplina', max_length=120, blank=True)
    avatar_url = models.URLField('URL do Avatar', max_length=500, blank=True)
    data_cadastro = models.DateTimeField('Data de Cadastro', auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = ProfessorManager()

    class Meta:
        verbose_name = 'Professor'
        verbose_name_plural = 'Professores'

    def __str__(self):
        return self.nome_completo or self.email

class AssinaturaProfessor(models.Model):
    PLANOS_CHOICES = [
        ('gratuito', 'Degustacao Gratis'),
        ('professor_geral', 'Professor Geral (Essencial)'),
        ('especialista_redacao', 'Especialista Redacao ENEM'),
        ('hub_completo', 'Hub Completo Pro'),
    ]

    professor = models.OneToOneField(Professor, on_delete=models.CASCADE, related_name='assinatura')
    tipo_plano = models.CharField('Plano Ativo', max_length=40, choices=PLANOS_CHOICES, default='gratuito')
    
    # 💳 Quotas de IA & Blindagem de Lucratividade
    creditos_mensais_total = models.PositiveIntegerField('Creditos Mensais do Plano', default=0)
    creditos_utilizados_mes = models.PositiveIntegerField('Creditos Gastos no Mes', default=0)
    creditos_avulsos_extras = models.PositiveIntegerField('Creditos Avulsos Comprados (Nao expiram)', default=0)
    data_renovacao_ciclo = models.DateField('Data de Renovacao do Ciclo', default=timezone.now)
    assinatura_ativa = models.BooleanField('Assinatura Ativa', default=True)

    # 🔒 Entitlements de Acesso aos Modulos
    tem_acesso_diario = models.BooleanField('Diario Pedagogico', default=True)
    tem_acesso_calendario = models.BooleanField('Calendario & Smart Shift', default=False)
    tem_acesso_atividades = models.BooleanField('Gerador de Atividades BNCC', default=False)
    tem_acesso_redacao = models.BooleanField('Corretor de Redacao ENEM', default=False)
    tem_acesso_agentes = models.BooleanField('Hub de Agentes de IA', default=False)
    tem_acesso_analytics = models.BooleanField('Dashboard Analytics', default=False)
    tem_acesso_gamificacao = models.BooleanField('Gamificacao de Aulas', default=False)

    class Meta:
        verbose_name = 'Assinatura do Professor'
        verbose_name_plural = 'Assinaturas de Professores'

    def __str__(self):
        return f"{self.professor.email} — {self.get_tipo_plano_display()} (Saldo: {self.saldo_disponivel})"

    @property
    def saldo_disponivel(self):
        """Retorna o total de creditos disponiveis (mensal restante + avulsos)."""
        saldo_mensal = max(0, self.creditos_mensais_total - self.creditos_utilizados_mes)
        return saldo_mensal + self.creditos_avulsos_extras

    def consumir_creditos(self, quantidade=1):
        """Debita creditos com seguranca atomica. Levanta PermissionDenied se saldo insuficiente."""
        if self.saldo_disponivel < quantidade:
            raise PermissionDenied(
                f"Saldo insuficiente de creditos de IA ({self.saldo_disponivel} disponiveis, {quantidade} necessarios). "
                "Faca upgrade de plano ou recarregue creditos avulsos."
            )

        saldo_mensal = self.creditos_mensais_total - self.creditos_utilizados_mes
        if saldo_mensal >= quantidade:
            self.creditos_utilizados_mes += quantidade
        else:
            resto = quantidade - max(0, saldo_mensal)
            self.creditos_utilizados_mes = self.creditos_mensais_total
            self.creditos_avulsos_extras = max(0, self.creditos_avulsos_extras - resto)
            
        self.save(update_fields=['creditos_utilizados_mes', 'creditos_avulsos_extras'])
