from django.urls import path
from .views import RegistroView, PerfilView, SaldoCreditosView

urlpatterns = [
    path('registro/', RegistroView.as_view(), name='registro'),
    path('perfil/', PerfilView.as_view(), name='perfil'),
    path('creditos/', SaldoCreditosView.as_view(), name='saldo_creditos'),
]
