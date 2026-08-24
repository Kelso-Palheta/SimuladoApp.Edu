import { describe, it, expect } from 'vitest';
import { PLANOS_CONFIG, verificarPermissaoModulo } from '../../frontend/src/config/planos';

describe('Sistema de Planos e Permissões de Módulos', () => {
  it('deve permitir acesso ao Diário Pedagógico para qualquer usuário (Gratuito)', () => {
    expect(verificarPermissaoModulo(null, 'diario-planejamento')).toBe(true);
    expect(verificarPermissaoModulo({}, 'diario-planejamento')).toBe(true);
    expect(verificarPermissaoModulo({ plano: 'gratuito' }, 'diario-planejamento')).toBe(true);
  });

  it('deve bloquear outros módulos para usuários do plano gratuito', () => {
    const perfilGratuito = { plano: 'gratuito', modulos_permitidos: ['diario-planejamento'] };
    expect(verificarPermissaoModulo(perfilGratuito, 'redacao-corretor')).toBe(false);
    expect(verificarPermissaoModulo(perfilGratuito, 'calendario-pedagogico')).toBe(false);
    expect(verificarPermissaoModulo(perfilGratuito, 'atividades-gerador')).toBe(false);
  });

  it('deve liberar módulos de planejamento para o Plano Professor Geral, mas bloquear Redação', () => {
    const perfilGeral = { plano: 'professor_geral' };
    expect(verificarPermissaoModulo(perfilGeral, 'diario-planejamento')).toBe(true);
    expect(verificarPermissaoModulo(perfilGeral, 'calendario-pedagogico')).toBe(true);
    expect(verificarPermissaoModulo(perfilGeral, 'gerador-atividades')).toBe(true);
    expect(verificarPermissaoModulo(perfilGeral, 'agente-linguagens')).toBe(true);
    expect(verificarPermissaoModulo(perfilGeral, 'analytics-pedagogico')).toBe(true);
    // Redação bloqueada no plano geral
    expect(verificarPermissaoModulo(perfilGeral, 'redacao-corretor')).toBe(false);
  });

  it('deve liberar Redação e Diário no Plano Especialista Redação', () => {
    const perfilRedacao = { plano: 'especialista_redacao' };
    expect(verificarPermissaoModulo(perfilRedacao, 'diario-planejamento')).toBe(true);
    expect(verificarPermissaoModulo(perfilRedacao, 'redacao-corretor')).toBe(true);
    expect(verificarPermissaoModulo(perfilRedacao, 'calendario-pedagogico')).toBe(false);
  });

  it('deve liberar todos os módulos para Hub Completo Pro e Combo Total', () => {
    const perfilCompleto = { plano: 'hub_completo' };
    expect(verificarPermissaoModulo(perfilCompleto, 'diario-planejamento')).toBe(true);
    expect(verificarPermissaoModulo(perfilCompleto, 'redacao-corretor')).toBe(true);
    expect(verificarPermissaoModulo(perfilCompleto, 'calendario-pedagogico')).toBe(true);
    expect(verificarPermissaoModulo(perfilCompleto, 'gerador-atividades')).toBe(true);
  });

  it('deve respeitar entitlements manuais no array modulos_permitidos', () => {
    const perfilCustom = { modulos_permitidos: ['gerador-atividades'] };
    expect(verificarPermissaoModulo(perfilCustom, 'gerador-atividades')).toBe(true);
    expect(verificarPermissaoModulo(perfilCustom, 'redacao-corretor')).toBe(false);
  });
});
