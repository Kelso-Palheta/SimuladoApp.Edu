// tests/unit/agentes_config.test.js
// RN-13, RN-14, RN-16 — Regras dos Agentes Pedagógicos
import { describe, it, expect } from 'vitest';
import { AGENTES_CONFIG, MODELO_AGENTE } from '../../frontend/src/data/agentes/agentesConfig.js';

describe('RN-16 — Segmentos Suportados no MVP', () => {
  it('deve ter exatamente 2 agentes configurados', () => {
    expect(AGENTES_CONFIG).toHaveLength(2);
  });

  it('deve conter os segmentos "ensino-medio" e "fundamental-2"', () => {
    const ids = AGENTES_CONFIG.map((a) => a.id);
    expect(ids).toContain('ensino-medio');
    expect(ids).toContain('fundamental-2');
  });
});

describe('RN-14 — Identidade Pedagógica Imutável', () => {
  it('todo agente deve ter id, name, segmento e promptChips não-vazios', () => {
    AGENTES_CONFIG.forEach((agente) => {
      expect(agente.id).toBeTruthy();
      expect(agente.name).toBeTruthy();
      expect(agente.segmento).toBeTruthy();
      expect(Array.isArray(agente.promptChips)).toBe(true);
      expect(agente.promptChips.length).toBeGreaterThan(0);
    });
  });

  it('agente de Ensino Médio deve mencionar EM ou ENEM no segmento', () => {
    const em = AGENTES_CONFIG.find((a) => a.id === 'ensino-medio');
    expect(em.segmento).toMatch(/Ensino Médio|EM|ENEM/i);
  });

  it('agente de Fundamental II deve mencionar Fundamental no segmento', () => {
    const ef2 = AGENTES_CONFIG.find((a) => a.id === 'fundamental-2');
    expect(ef2.segmento).toMatch(/Fundamental|EF2/i);
  });
});

describe('RN-13 — Modelo Exclusivo de IA', () => {
  it('o modelo padrão dos agentes deve ser sabiazinho-4', () => {
    expect(MODELO_AGENTE).toBe('sabiazinho-4');
  });
});
