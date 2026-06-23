import { useState, useEffect, useCallback, useRef } from 'react';
import { normalizeNome, cleanNome, genId } from '@/utils/diario/calculos';

export const useTurmas = (initialTurmas, persistTurmas) => {
  const [turmas, setTurmas] = useState(() => {
    if (initialTurmas && initialTurmas.length > 0) return initialTurmas;
    return [];
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (persistTurmas) {
      persistTurmas(turmas);
    }
  }, [turmas, persistTurmas]);

  useEffect(() => {
    if (initialTurmas && initialTurmas.length > 0) {
      setTurmas((prev) => {
        // Se a lista atual está vazia, aceita a inicial (útil para carregamento async)
        if (prev.length === 0) return initialTurmas;
        return prev;
      });
    }
  }, [initialTurmas]);

  const addTurma = useCallback((nome) => {
    const id = `turma-${nome.trim().replace(/\s+/g, '-').toLowerCase()}-${genId()}`;
    const bimestres = {};
    [1, 2, 3, 4].forEach((b) => {
      bimestres[String(b)] = { atividades: [], notas: {} };
    });
    const nova = { id, nome: nome.trim(), alunos: [], bimestres };
    setTurmas((prev) => [...prev, nova]);
    return nova;
  }, []);

  const removeTurma = useCallback((turmaId) => {
    setTurmas((prev) => prev.filter((t) => t.id !== turmaId));
  }, []);

  const addAlunos = useCallback((turmaId, nomesNovos) => {
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== turmaId) return t;
        const existentesNormalizados = new Set(t.alunos.map((a) => normalizeNome(a.nome)));
        const novos = nomesNovos
          .filter((n) => {
            const norm = normalizeNome(n);
            if (existentesNormalizados.has(norm)) return false;
            existentesNormalizados.add(norm);
            return true;
          })
          .map((nome) => ({ id: `al_${genId()}`, nome: cleanNome(nome) }));
        const alunos = [...t.alunos, ...novos].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        return { ...t, alunos };
      })
    );
  }, []);

  const removeAluno = useCallback((turmaId, alunoId) => {
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== turmaId) return t;
        const alunos = t.alunos.filter((a) => a.id !== alunoId);
        const bimestres = {};
        Object.entries(t.bimestres).forEach(([b, dados]) => {
          const notas = { ...dados.notas };
          delete notas[alunoId];
          bimestres[b] = { ...dados, notas };
        });
        return { ...t, alunos, bimestres };
      })
    );
  }, []);

  const removeAlunos = useCallback((turmaId, alunoIds) => {
    const idsSet = new Set(alunoIds);
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== turmaId) return t;
        const alunos = t.alunos.filter((a) => !idsSet.has(a.id));
        const bimestres = {};
        Object.entries(t.bimestres).forEach(([b, dados]) => {
          const notas = { ...dados.notas };
          alunoIds.forEach((alId) => { delete notas[alId]; });
          bimestres[b] = { ...dados, notas };
        });
        const recuperacao = { ...(t.recuperacao || {}) };
        alunoIds.forEach((alId) => { delete recuperacao[alId]; });
        return { ...t, alunos, bimestres, recuperacao };
      })
    );
  }, []);

  const setRecuperacao = useCallback((turmaId, alunoId, tipo, valor) => {
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== turmaId) return t;
        const recObj = t.recuperacao || {};
        const alunoRec = typeof recObj[alunoId] === 'object' ? recObj[alunoId] : {};
        const novoValor = valor === '' ? '' : Number(valor);
        return {
          ...t,
          recuperacao: {
            ...recObj,
            [alunoId]: { ...alunoRec, [tipo]: novoValor }
          }
        };
      })
    );
  }, []);

  const addAlunoManual = useCallback((turmaId, dados) => {
    const novoAluno = {
      id: `al_${genId()}`,
      nome: cleanNome(dados.nome),
      ...(dados.dataNascimento ? { dataNascimento: dados.dataNascimento } : {})
    };
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== turmaId) return t;
        if (t.alunos.some((a) => normalizeNome(a.nome) === normalizeNome(dados.nome))) return t;
        const alunos = [...t.alunos, novoAluno].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        return { ...t, alunos };
      })
    );
    return novoAluno;
  }, []);

  const updateAluno = useCallback((turmaId, alunoId, updates) => {
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== turmaId) return t;
        return { ...t, alunos: t.alunos.map((al) => al.id === alunoId ? { ...al, ...updates } : al) };
      })
    );
  }, []);

  return { turmas, setTurmas, addTurma, removeTurma, addAlunos, addAlunoManual, removeAluno, removeAlunos, setRecuperacao, updateAluno };
};
