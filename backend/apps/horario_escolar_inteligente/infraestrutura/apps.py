"""
Configuração do Django App de Infraestrutura (src/infraestrutura/apps.py)
"""
from django.apps import AppConfig


class InfraestruturaConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "src.infraestrutura"
    verbose_name = "Infraestrutura e Persistência"
