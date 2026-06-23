"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from '@/components/diario/Sidebar';
import { TurmaView } from '@/components/diario/TurmaView';
import { ProfileModal } from '@/components/diario/ProfileModal';
import { useTurmas } from '@/hooks/diario/useTurmas';
import { useNotas } from '@/hooks/diario/useNotas';
import { turmasIniciais } from '@/data/diario/turmasIniciais';
import { ArrowLeft, GraduationCap, ExternalLink, Copy, Check } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const STORAGE_KEY = 'diario_turmas';
const NOVOS_DEFAULTS = {
  simuladoMaxLanca: 5, simuladoMaxFinal: 5,
  atividadesMaxFinal: 5, mediaAprovacao: 5, mediaRecuperacao: 4.99
};

const carregarLocal = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignora */ }
  return null;
};

const salvarLocal = (turmas) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(turmas));
  } catch { /* ignora */ }
};

export default function DiarioPage() {
  const { user, perfil, loading } = useAuth();
  const router = useRouter();

  const [initialTurmas, setInitialTurmas] = useState(null);
  const [firestoreLoaded, setFirestoreLoaded] = useState(false);

  // Carrega turmas: Firestore > localStorage > padrão
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        // Tenta carregar do Firestore (caminho antigo do projeto legado)
        const oldRef = doc(db, 'users', user.uid, 'turmas', 'data');
        const oldSnap = await getDoc(oldRef);
        if (oldSnap.exists() && oldSnap.data().turmas?.length > 0) {
          const firestoreData = oldSnap.data().turmas;
          setInitialTurmas(firestoreData);
          // Salva no localStorage como cache
          salvarLocal(firestoreData);
          // Migra para o novo caminho (subcoleção isolada)
          const newRef = doc(db, 'professores', user.uid, 'turmas', 'data');
          await setDoc(newRef, { turmas: firestoreData, updatedAt: serverTimestamp() }, { merge: true });
        } else {
          // Tenta o novo caminho (subcoleção isolada)
          const newRef = doc(db, 'professores', user.uid, 'turmas', 'data');
          const newSnap = await getDoc(newRef);
          if (newSnap.exists() && newSnap.data().turmas?.length > 0) {
            setInitialTurmas(newSnap.data().turmas);
            salvarLocal(newSnap.data().turmas);
          } else {
            // Fallback: localStorage ou dados iniciais
            const local = carregarLocal();
            setInitialTurmas(local?.length > 0 ? local : []);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar turmas:', err);
        const local = carregarLocal();
        setInitialTurmas(local?.length > 0 ? local : []);
      } finally {
        setFirestoreLoaded(true);
      }
    };
    load();
  }, [user]);

  const persistTimeout = useRef(null);

  // Persiste no Firestore (subcoleção isolada) + localStorage (com debounce)
  const persistir = useCallback((turmas) => {
    salvarLocal(turmas);
    if (!user) return;
    if (persistTimeout.current) clearTimeout(persistTimeout.current);
    persistTimeout.current = setTimeout(() => {
      const ref = doc(db, 'professores', user.uid, 'turmas', 'data');
      setDoc(ref, { turmas, updatedAt: serverTimestamp() }, { merge: true }).catch((e) => {
        console.error('Erro ao salvar turmas:', e);
      });
    }, 300);
  }, [user]);

  const { turmas, setTurmas, addTurma, removeTurma, addAlunos, addAlunoManual,
    removeAluno, removeAlunos, setRecuperacao, updateAluno } = useTurmas(initialTurmas || [], persistir);

  const { setNota, addAtividade, removeAtividade, updateAtividadeMax, updateConfig,
    clearAtividadesNota, clearAtividadesTurma, clearSimuladoNota, clearSimuladoTurma } = useNotas(setTurmas);

  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [showAlunoDropdown, setShowAlunoDropdown] = useState(false);
  const [alunoLinkCopied, setAlunoLinkCopied] = useState(false);
  const alunoDropdownRef = useRef(null);
  const [showProfile, setShowProfile] = useState(false);
  const [bimestre, setBimestre] = useState(() => {
    if (typeof window !== 'undefined') return Number(localStorage.getItem('diario_bimestre')) || 1;
    return 1;
  });
  const configsMigradas = useRef(false);

  const handleSetBimestre = (b) => { setBimestre(b); localStorage.setItem('diario_bimestre', b); };
  const turmaAtual = turmas.find((t) => t.id === turmaSelecionada?.id) || turmas[0] || null;

  const handleAddTurma = (nome) => {
    const nova = addTurma(nome);
    setTurmaSelecionada(nova);
  };

  const handleRemoveTurma = (id) => {
    removeTurma(id);
    if (turmaSelecionada?.id === id) {
      const restantes = turmas.filter((t) => t.id !== id);
      setTurmaSelecionada(restantes[0] || null);
    }
  };

  // Migra defaults para todas as turmas
  useEffect(() => {
    if (!user || configsMigradas.current || turmas.length === 0) return;
    configsMigradas.current = true;
    for (const turma of turmas) {
      for (let b = 1; b <= 4; b++) {
        const existente = turma.bimestres[String(b)]?.config;
        const precisa = !existente
          || existente.simuladoMaxLanca !== NOVOS_DEFAULTS.simuladoMaxLanca
          || existente.simuladoMaxFinal !== NOVOS_DEFAULTS.simuladoMaxFinal
          || existente.atividadesMaxFinal !== NOVOS_DEFAULTS.atividadesMaxFinal
          || existente.mediaAprovacao !== NOVOS_DEFAULTS.mediaAprovacao
          || existente.mediaRecuperacao !== NOVOS_DEFAULTS.mediaRecuperacao;
        if (precisa) updateConfig(turma.id, b, NOVOS_DEFAULTS);
      }
    }
  }, [user, turmas, updateConfig]);

  // Fecha dropdown do aluno ao clicar fora
  useEffect(() => {
    const handleClick = (e) => {
      if (alunoDropdownRef.current && !alunoDropdownRef.current.contains(e.target)) {
        setShowAlunoDropdown(false);
      }
    };
    if (showAlunoDropdown) document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showAlunoDropdown]);

  // Auth guard + firestore loading
  if (loading || !firestoreLoaded || (!perfil && user)) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-tr from-violet-700 to-violet-400 animate-pulse" />
          <p className="text-sm text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.replace('/');
    return null;
  }

  if (!perfil?.modulos_permitidos?.includes('diario-planejamento')) {
    router.replace('/');
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar
        turmas={turmas}
        turmaSelecionada={turmaAtual}
        bimestreSelecionado={bimestre}
        user={user}
        onSelectTurma={setTurmaSelecionada}
        onSelectBimestre={handleSetBimestre}
        onAddTurma={handleAddTurma}
        onRemoveTurma={handleRemoveTurma}
        onReorderTurmas={setTurmas}
        onLogout={() => router.push('/')}
        onOpenProfile={() => setShowProfile(true)}
      />

      {showProfile && (
        <ProfileModal user={user} onClose={() => setShowProfile(false)} />
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex-shrink-0 px-6 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-200 hover:border-violet-300 transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            Hub
          </button>

          <div className="relative" ref={alunoDropdownRef}>
            <button
              onClick={() => setShowAlunoDropdown(!showAlunoDropdown)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-200 hover:border-violet-300 transition-all shadow-sm"
            >
              <GraduationCap size={16} />
              Portal do Aluno
              <ExternalLink size={12} className="opacity-40" />
            </button>

            {showAlunoDropdown && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-40 overflow-hidden animate-card-in">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/aluno`);
                    setAlunoLinkCopied(true);
                    setTimeout(() => setAlunoLinkCopied(false), 2000);
                    setShowAlunoDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {alunoLinkCopied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                  {alunoLinkCopied ? 'Copiado!' : 'Copiar link'}
                </button>
                <div className="border-t border-slate-100" />
                <a
                  href="/aluno"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink size={15} />
                  Abrir em nova aba
                </a>
              </div>
            )}
          </div>
        </div>

        {turmaAtual ? (
          <TurmaView
            key={`${turmaAtual.id}-${bimestre}`}
            turma={turmaAtual}
            turmas={turmas}
            bimestre={bimestre}
            user={user}
            onSetNota={setNota}
            onAddAtv={addAtividade}
            onRemoveAtv={removeAtividade}
            onUpdateAtvMax={updateAtividadeMax}
            onAddAlunos={addAlunos}
            onRemoveAluno={removeAluno}
            onRemoveAlunos={removeAlunos}
            onUpdateConfig={updateConfig}
            onSetRecuperacao={setRecuperacao}
            onClearAtividadesNota={clearAtividadesNota}
            onClearAtividadesTurma={clearAtividadesTurma}
            onClearSimuladoNota={clearSimuladoNota}
            onClearSimuladoTurma={clearSimuladoTurma}
            onAddAlunoManual={addAlunoManual}
            onUpdateAluno={updateAluno}
            onRemoveTurma={handleRemoveTurma}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-20">📚</div>
              <p className="text-slate-800 font-semibold text-lg">Nenhuma turma cadastrada</p>
              <p className="text-sm mt-1 text-slate-400">Adicione uma turma na barra lateral para começar.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
