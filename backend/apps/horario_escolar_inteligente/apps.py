"""
Configuração do App Django: Horário Escolar Inteligente
"""
from django.apps import AppConfig


class HorarioEscolarInteligenteConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.horario_escolar_inteligente"
    verbose_name = "Horário Escolar Inteligente"
