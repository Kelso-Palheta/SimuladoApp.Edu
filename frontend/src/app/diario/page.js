"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from '@/components/diario/Sidebar';
import { TurmaView } from '@/components/diario/TurmaView';
import { ProfileModal } from '@/components/diario/ProfileModal';
import { useTurmas } from '@/hooks/diario/useTurmas';
import { useNotas } from '@/hooks/diario/useNotas';
import { ArrowLeft, GraduationCap, ExternalLink, Copy, Check, Award } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { gerarLoginAluno, gerarLoginKey } from '@/utils/diario/loginAluno';

const STORAGE_KEY = 'diario_turmas';
const USER_KEY = 'diario_userId';
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

const salvarLocal = (turmas, timestamp = null) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(turmas));
    localStorage.setItem(STORAGE_KEY + '_lastUpdated', String(timestamp || Date.now()));
  } catch { /* ignora */ }
};

export default function DiarioPage() {
  const { user, perfil, loading } = useAuth();
  const router = useRouter();

  const [initialTurmas, setInitialTurmas] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return [];
  });
  const [loadingTurmas, setLoadingTurmas] = useState(true);

  // Timeout de segurança: evita tela de loading eterna
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setLoadingTurmas(false);
    }, 8000);
    return () => clearTimeout(safetyTimer);
  }, []);

  // Carrega do Firestore se localStorage estiver vazio, ou sync em background
  useEffect(() => {
    if (loading) return; // Aguarda o carregamento do estado de autenticação
    if (!user) {
      setLoadingTurmas(false);
      return;
    }

    (async () => {
      let finalLoadedTurmas = [];
      try {
        const storedUserId = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
        const isSameUser = storedUserId === user.uid;
        const local = isSameUser ? carregarLocal() : null;

        const ref = doc(db, 'professores', user.uid, 'turmas', 'data');
        const snap = await getDoc(ref);

        if (snap.exists() && snap.data().turmas?.length > 0) {
          const cloud = snap.data().turmas;
          const cloudTime = snap.data().lastUpdated || 0;
          const localTime = typeof window !== 'undefined' ? Number(localStorage.getItem(STORAGE_KEY + '_lastUpdated')) || 0 : 0;

          if (cloudTime >= localTime || !local) {
            setInitialTurmas(cloud);
            salvarLocal(cloud, cloudTime);
            finalLoadedTurmas = cloud;
          } else {
            setInitialTurmas(local);
            await setDoc(ref, { turmas: local, lastUpdated: localTime }, { merge: true });
            finalLoadedTurmas = local;
          }
          if (typeof window !== 'undefined') localStorage.setItem(USER_KEY, user.uid);
        } else {
          // Sem dados na subcoleção: tenta migrar de caminhos antigos
          const oldRef = doc(db, 'users', user.uid, 'turmas', 'data');
          const oldSnap = await getDoc(oldRef);
          if (oldSnap.exists() && oldSnap.data().turmas?.length > 0) {
            const oldData = oldSnap.data().turmas;
            await setDoc(ref, { turmas: oldData, lastUpdated: Date.now() }, { merge: true });
            setInitialTurmas(oldData);
            salvarLocal(oldData);
            finalLoadedTurmas = oldData;
          } else {
            // Tenta do outro caminho antigo (campo turmas no próprio perfil do professor)
            const profRef = doc(db, 'professores', user.uid);
            const profSnap = await getDoc(profRef);
            if (profSnap.exists() && profSnap.data().turmas?.length > 0) {
              const oldData = profSnap.data().turmas;
              await setDoc(ref, { turmas: oldData, lastUpdated: Date.now() }, { merge: true });
              setInitialTurmas(oldData);
              salvarLocal(oldData);
              finalLoadedTurmas = oldData;
            } else if (local && local.length > 0) {
              setInitialTurmas(local);
              finalLoadedTurmas = local;
            } else {
              setInitialTurmas([]);
              salvarLocal([]);
              finalLoadedTurmas = [];
            }
          }
          if (typeof window !== 'undefined') localStorage.setItem(USER_KEY, user.uid);
        }
      } catch (e) {
        console.error('Erro ao carregar turmas:', e);
        // Fallback local caso haja falha de rede/conexão para o mesmo usuário
        const storedUserId = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
        if (storedUserId === user.uid) {
          const local = carregarLocal();
          if (local) {
            setInitialTurmas(local);
            finalLoadedTurmas = local;
          }
        }
      } finally {
        setLoadingTurmas(false);
        if (user && finalLoadedTurmas) {
          const { limparTodosVinculosOrfaos } = await import('@/lib/firebase-aluno');
          limparTodosVinculosOrfaos(user.uid, finalLoadedTurmas).catch(console.error);
        }
      }
    })();
  }, [user, loading]);

  const persistTimeout = useRef(null);
  const latestTurmasRef = useRef([]);

  // Sincroniza o valor mais atual das turmas em um ref para salvamento no unmount
  useEffect(() => {
    latestTurmasRef.current = initialTurmas || [];
  }, [initialTurmas]);

  // Persiste no Firestore (subcoleção isolada) + localStorage (com debounce)
  const persistir = useCallback((novasTurmas) => {
    if (loadingTurmas) return; // CRÍTICO: Não persiste enquanto estiver carregando os dados iniciais do Firestore!
    latestTurmasRef.current = novasTurmas;
    const nowTime = Date.now();
    salvarLocal(novasTurmas, nowTime);
    setInitialTurmas(novasTurmas);
    if (typeof window !== 'undefined' && user) localStorage.setItem(USER_KEY, user.uid);
    if (!user) return;
    if (persistTimeout.current) clearTimeout(persistTimeout.current);
    persistTimeout.current = setTimeout(async () => {
      const ref = doc(db, 'professores', user.uid, 'turmas', 'data');
      try {
        await setDoc(ref, { turmas: novasTurmas, lastUpdated: nowTime }, { merge: true });
        
        // Sincroniza logins e notas dos alunos no portal do aluno automaticamente
        const nomeProfessor = perfil?.nome || user.displayName || 'Professor';
        for (const turma of novasTurmas) {
          for (const aluno of (turma.alunos || [])) {
            if (aluno.dataNascimento) {
              const loginStr = gerarLoginAluno(aluno.nome, aluno.dataNascimento);
              const loginKey = await gerarLoginKey(loginStr);
              
              // 1. Vincula aluno ao professor
              const baseRef = doc(db, 'alunoLogin', loginKey);
              await setDoc(baseRef, { nome: aluno.nome, login: loginStr }, { merge: true });
              
              const vinculoRef = doc(db, 'alunoLogin', loginKey, 'vinculos', user.uid);
              await setDoc(vinculoRef, {
                professorUid: user.uid,
                turmaId: turma.id,
                turmaNome: turma.nome,
                alunoId: aluno.id,
                modulo: 'diario',
                nomeProfessor,
                atualizadoEm: serverTimestamp()
              }, { merge: true });
              
              // 2. Sincroniza as notas deste aluno
              const recordId = `${user.uid}_${turma.id}_${aluno.id}`;
              const notaRef = doc(db, 'notasAluno', recordId);
              await setDoc(notaRef, {
                nome: aluno.nome,
                bimestres: turma.bimestres || {},
                atualizadoEm: serverTimestamp()
              }, { merge: true });
            }
          }
        }
      } catch (e) {
        console.error('Erro ao persistir e sincronizar turmas:', e);
      }
    }, 500);
  }, [user, perfil, loadingTurmas]);

  // Salva imediatamente no Firestore/localStorage ao desmontar o componente (ex: mudar de módulo)
  useEffect(() => {
    return () => {
      if (persistTimeout.current) {
        clearTimeout(persistTimeout.current);
        const finalTurmas = latestTurmasRef.current;
        if (finalTurmas && finalTurmas.length > 0 && user?.uid) {
          const nowTime = Date.now();
          salvarLocal(finalTurmas, nowTime);
          const ref = doc(db, 'professores', user.uid, 'turmas', 'data');
          setDoc(ref, { turmas: finalTurmas, lastUpdated: nowTime }, { merge: true }).catch((e) => {
            console.error('Erro ao persistir no unmount:', e);
          });
        }
      }
    };
  }, [user]);

  const { turmas, setTurmas, addTurma, removeTurma, addAlunos, addAlunoManual,
    removeAluno, removeAlunos, setRecuperacao, updateAluno } = useTurmas(initialTurmas || [], persistir);

  const { setNota, addAtividade, removeAtividade, updateAtividadeMax, updateConfig,
    clearAtividadesNota, clearAtividadesTurma, clearSimuladoNota, clearSimuladoTurma } = useNotas(setTurmas);

  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handlePublishGrades = async () => {
    if (publishing || !user || turmas.length === 0) return;
    setPublishing(true);
    setToast('Publicando notas...');

    try {
      const nomeProfessor = perfil?.nome || user.displayName || 'Professor';
      const token = await user.getIdToken();

      const res = await fetch('/api/publicar-notas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: user.uid, nomeProfessor, turmas })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro desconhecido');

      if (data.erros > 0) {
        setToast(`✅ ${data.total} alunos publicados (${data.erros} falhas).`);
      } else {
        setToast(`✅ ${data.total} alunos publicados no Portal do Aluno!`);
      }
    } catch (e) {
      console.error('Erro ao publicar notas:', e);
      setToast(`Erro ao publicar: ${e.message}. Tente novamente.`);
    } finally {
      setPublishing(false);
    }
  };

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

  const handleRemoveTurma = async (id) => {
    const turma = turmas.find(t => t.id === id);
    removeTurma(id);
    if (turmaSelecionada?.id === id) {
      const restantes = turmas.filter((t) => t.id !== id);
      setTurmaSelecionada(restantes[0] || null);
    }
    if (turma && user) {
      const { limparVinculosOrfaos } = await import('@/lib/firebase-aluno');
      const turmasAtivas = turmas.filter(t => t.id !== id);
      await limparVinculosOrfaos(user.uid, turmasAtivas, turma.alunos || []);
    }
  };

  const handleRemoveAluno = async (turmaId, alunoId) => {
    const turma = turmas.find(t => t.id === turmaId);
    const aluno = turma?.alunos?.find(a => a.id === alunoId);
    removeAluno(turmaId, alunoId);
    
    if (aluno && user) {
      const { limparVinculosOrfaos } = await import('@/lib/firebase-aluno');
      const turmasAtivas = turmas.map(t => {
        if (t.id === turmaId) return { ...t, alunos: t.alunos.filter(a => a.id !== alunoId) };
        return t;
      });
      await limparVinculosOrfaos(user.uid, turmasAtivas, [aluno]);
    }
  };

  const handleRemoveAlunos = async (turmaId, alunoIds) => {
    const turma = turmas.find(t => t.id === turmaId);
    const alunosRemovidos = turma?.alunos?.filter(a => alunoIds.includes(a.id)) || [];
    removeAlunos(turmaId, alunoIds);
    
    if (alunosRemovidos.length > 0 && user) {
      const { limparVinculosOrfaos } = await import('@/lib/firebase-aluno');
      const turmasAtivas = turmas.map(t => {
        if (t.id === turmaId) return { ...t, alunos: t.alunos.filter(a => !alunoIds.includes(a.id)) };
        return t;
      });
      await limparVinculosOrfaos(user.uid, turmasAtivas, alunosRemovidos);
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

  const [authTimeout, setAuthTimeout] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAuthTimeout(true), 10000);
    return () => clearTimeout(t);
  }, []);

  // Auth guard + carregamento inicial de turmas
  if ((loading && !authTimeout) || loadingTurmas || (!perfil && user && !authTimeout)) {
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

          <div className="flex items-center gap-2">
            <button
              onClick={handlePublishGrades}
              disabled={publishing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 hover:border-emerald-300 transition-all shadow-sm disabled:opacity-50"
            >
              <Award size={16} />
              {publishing ? 'Publicando...' : 'Publicar Notas'}
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
            onRemoveAluno={handleRemoveAluno}
            onRemoveAlunos={handleRemoveAlunos}
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

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check size={14} className="text-green-400" />
          {toast}
        </div>
      )}
    </div>
  );
}
