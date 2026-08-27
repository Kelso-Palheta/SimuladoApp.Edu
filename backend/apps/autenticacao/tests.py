from django.test import TestCase
from rest_framework.exceptions import PermissionDenied
from apps.autenticacao.models import Professor, AssinaturaProfessor

class AutenticacaoCreditosTestCase(TestCase):
    def setUp(self):
        self.professor = Professor.objects.create_user(
            email='prof.redacao@escola.com.br',
            password='senhaSegura123',
            nome_completo='Prof. Roberto Redação'
        )
        self.assinatura = self.professor.assinatura

    def test_assinatura_gratuita_criada_automaticamente(self):
        """Garante que novo professor nasce no plano gratuito com saldo 0 de IA."""
        self.assertEqual(self.assinatura.tipo_plano, 'gratuito')
        self.assertEqual(self.assinatura.saldo_disponivel, 0)
        self.assertTrue(self.assinatura.tem_acesso_diario)
        self.assertFalse(self.assinatura.tem_acesso_redacao)

    def test_consumo_creditos_plano_especialista(self):
        """Verifica consumo correto de franquia no plano de 300 redacoes/mes."""
        self.assinatura.tipo_plano = 'especialista_redacao'
        self.assinatura.creditos_mensais_total = 300
        self.assinatura.tem_acesso_redacao = True
        self.assinatura.save()

        self.assertEqual(self.assinatura.saldo_disponivel, 300)

        # Consome 2 créditos (1 redação completa)
        self.assinatura.consumir_creditos(2)
        self.assinatura.refresh_from_db()
        self.assertEqual(self.assinatura.creditos_utilizados_mes, 2)
        self.assertEqual(self.assinatura.saldo_disponivel, 298)

    def test_bloqueio_quando_saldo_insuficiente(self):
        """Garante que PermissionDenied e levantada se nao houver creditos disponiveis."""
        self.assinatura.creditos_mensais_total = 1
        self.assinatura.save()

        with self.assertRaises(PermissionDenied):
            self.assinatura.consumir_creditos(2)
