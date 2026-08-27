from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Professor, AssinaturaProfessor

class AssinaturaInline(admin.StackedInline):
    model = AssinaturaProfessor
    can_delete = False
    verbose_name_plural = 'Assinatura & Creditos'

@admin.register(Professor)
class ProfessorAdmin(UserAdmin):
    inlines = (AssinaturaInline,)
    list_display = ('email', 'nome_completo', 'escola', 'disciplina_principal', 'get_plano', 'get_saldo', 'is_active')
    search_fields = ('email', 'nome_completo', 'escola')
    ordering = ('-data_cadastro',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informacoes Pessoais', {'fields': ('nome_completo', 'escola', 'disciplina_principal', 'avatar_url')}),
        ('Permissoes Administrativas', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )

    def get_plano(self, obj):
        return obj.assinatura.get_tipo_plano_display() if hasattr(obj, 'assinatura') else '-'
    get_plano.short_description = 'Plano'

    def get_saldo(self, obj):
        return obj.assinatura.saldo_disponivel if hasattr(obj, 'assinatura') else '-'
    get_saldo.short_description = 'Saldo IA'
