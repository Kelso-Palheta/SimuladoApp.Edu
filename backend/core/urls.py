from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth JWT & Perfil
    path('api/v1/auth/', include('apps.autenticacao.urls')),
    path('api/v1/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Diário Pedagógico (Turmas, Alunos, Notas)
    path('api/v1/diario/', include('apps.diario.urls')),

    # Calendário Pedagógico & Smart Shift
    path('api/v1/calendario/', include('apps.calendario.urls')),

    # Atividades BNCC & Questões
    path('api/v1/atividades/', include('apps.atividades.urls')),

    # Redação ENEM & OpenCV
    path('api/v1/redacao/', include('apps.redacao.urls')),
]
