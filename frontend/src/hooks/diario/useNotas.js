import { useCallback } from 'react';
import { clamp, genId, round2 } from '@/utils/diario/calculos';

export const useNotas = (setTurmas) => {
  const setNota = useCallback((turmaId, bimestre, alunoId, campo, valor) => {
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== turmaId) return t;
        const b = String(bimestre);
        const notasAnteriores = t.bimestres[b]?.notas || {};
        return {
          ...t,
          bimestres: {
            ...t.bimestres,
            [b]: {
              ...t.bimestres[b],
              notas: {
                ...notasAnteriores,
                [alunoId]: {
                  ...(notasAnteriores[alunoId] || {}),
                  [campo]: valor === '' ? '' : Number(valor)
                }
              }
            }
          }
        };
      })
    );
  }, [setTurmas]);

  const addAtividade = useCallback((turmaId, bimestre, nome, max, atvIdNoMapa) => {
    const id = atvIdNoMapa || `atv_${genId()}`;
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== turmaId) return t;
        const b = String(bimestre);
        return {
          ...t,
          bimestres: {
            ...t.bimestres,
            [b]: {
              ...t.bimestres[b],
              atividades: [
                ...(t.bimestres[b]?.atividades || []),
                { id, nome: nome.trim(), max: round2(clamp(Number(max) || 0, 0, 10)) }
              ]
            }
          }
        };
      })
    );
  }, [setTurmas]);

  const removeAtividade = useCallback((turmaId, bimestre, atvId) => {
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== turmaId) return t;
        const b = String(bimestre);
        const atividades = (t.bimestres[b]?.atividades || []).filter((a) => a.id !== atvId);
        const notas = {};
        Object.entries(t.bimestres[b]?.notas || {}).forEach(([alId, vals]) => {
          const { [atvId]: _, ...resto } = vals;
          notas[alId] = resto;
        });
        return {
          ...t,
          bimestres: { ...t.bimestres, [b]: { ...t.bimestres[b], atividades, notas } }
        };
      })
    );
  }, [setTurmas]);

  const renameAtividade = useCallback((turmaId, bimestre, atvId, novoNome) => {
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== turmaId) return t;
        const b = String(bimestre);
        return {
          ...t,
          bimestres: {
            ...t.bimestres,
            [b]: {
              ...t.bimestres[b],
              atividades: (t.bimestres[b]?.atividades || []).map((a) =>
                a.id === atvId ? { ...a, nome: novoNome } : a
              )
            }
          }
        };
      })
    );
  }, [setTurmas]);

  const updateConfig = useCallback((turmaId, bimestre, newConfig) => {
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== turmaId) return t;
        const b = String(bimestre);
        const bData = t.bimestres[b] || { atividades: [], notas: {} };
        return {
          ...t,
          bimestres: {
            ...t.bimestres,
            [b]: {
              ...bData,
              config: {
                ...(bData.config || { simuladoMaxLanca: 5, simuladoMaxFinal: 5, atividadesMaxFinal: 5, mediaAprovacao: 5, mediaRecuperacao: 4.99 }),
                ...newConfig
              }
            }
          }
        };
      })
    );
  }, [setTurmas]);

  const clearAtividadesNota = useCallback((turmaId, bimestre, alunoId) => {
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== turmaId) return t;
        const b = String(bimestre);
        const bData = t.bimestres[b];
        if (!bData) return t;
        const notas = { ...bData.notas };
        const alunoNotas = notas[alunoId] || {};
        notas[alunoId] = { simulado: alunoNotas.simulado };
        return {
          ...t,
          bimestres: {
            ...t.bimestres,
            [b]: { ...bData, notas }
          }
        };
      })
    );
  }, [setTurmas]);

  const clearAtividadesTurma = useCallback((turmaId, bimestre) => {
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== turmaId) return t;
        const b = String(bimestre);
        const bData = t.bimestres[b];
        if (!bData) return t;
        const notas = {};
        Object.entries(bData.notas || {}).forEach(([alId, val]) => {
          notas[alId] = { simulado: val?.simulado };
        });
        return {
          ...t,
          bimestres: {
            ...t.bimestres,
            [b]: { ...bData, notas }
          }
        };
      })
    );
  }, [setTurmas]);

  const updateAtividadeMax = useCallback((turmaId, bimestre, atvId, novoMax) => {
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== turmaId) return t;
        const b = String(bimestre);
        return {
          ...t,
          bimestres: {
            ...t.bimestres,
            [b]: {
              ...t.bimestres[b],
              atividades: (t.bimestres[b]?.atividades || []).map((a) =>
                a.id === atvId ? { ...a, max: round2(clamp(Number(novoMax) || 0, 0, 10)) } : a
              )
            }
          }
        };
      })
    );
  }, [setTurmas]);

  return { setNota, addAtividade, removeAtividade, renameAtividade, updateAtividadeMax, updateConfig, clearAtividadesNota, clearAtividadesTurma };
};
