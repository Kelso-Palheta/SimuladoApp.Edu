from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GradeHorariaViewSet, EmentaTemaViewSet, AulaAgendadaViewSet, SmartShiftView

router = DefaultRouter()
router.register(r'grades', GradeHorariaViewSet, basename='grade_horaria')
router.register(r'ementas', EmentaTemaViewSet, basename='ementa_tema')
router.register(r'aulas', AulaAgendadaViewSet, basename='aula_agendada')

urlpatterns = [
    path('', include(router.urls)),
    path('smart-shift/', SmartShiftView.as_view(), name='smart_shift'),
]
