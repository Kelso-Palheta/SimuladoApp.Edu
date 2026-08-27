from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Professor, AssinaturaProfessor
from .serializers import ProfessorSerializer, RegistroProfessorSerializer, AssinaturaSerializer

class RegistroView(generics.CreateAPIView):
    queryset = Professor.objects.all()
    serializer_class = RegistroProfessorSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        professor = serializer.save()
        
        # Gera tokens JWT
        refresh = RefreshToken.for_user(professor)
        
        return Response({
            'professor': ProfessorSerializer(professor).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

class PerfilView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfessorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class SaldoCreditosView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        assinatura, _ = AssinaturaProfessor.objects.get_or_create(professor=request.user)
        return Response({
            'tipo_plano': assinatura.tipo_plano,
            'saldo_disponivel': assinatura.saldo_disponivel,
            'creditos_mensais_total': assinatura.creditos_mensais_total,
            'creditos_utilizados_mes': assinatura.creditos_utilizados_mes,
            'creditos_avulsos_extras': assinatura.creditos_avulsos_extras,
            'data_renovacao_ciclo': assinatura.data_renovacao_ciclo,
        })
