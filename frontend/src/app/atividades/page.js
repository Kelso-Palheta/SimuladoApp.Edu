"use client";

import { useState, useRef, useEffect } from 'react';

export const dynamic = "force-dynamic";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTurmas } from '@/hooks/diario/useTurmas';
import { turmasIniciais } from '@/data/diario/turmasIniciais';
import { useAtividades } from '@/hooks/atividades/useAtividades';
import { useNotas } from '@/hooks/diario/useNotas';
import { AtividadesList } from '@/components/atividades/AtividadesList';
import { TodasAtividades } from '@/components/atividades/TodasAtividades';
import { Sidebar } from '@/components/diario/Sidebar';
import { ProfileModal } from '@/components/diario/ProfileModal';
import { ArrowLeft, GraduationCap, Layers, ExternalLink, Copy, Check } from 'lucide-react';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const STORAGE_KEY = 'diario_turmas';
const USER_KEY = 'diario_userId';

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

export default function AtividadesPage() {
  const { user, perfil, loading, logout } = useAuth();
  const router = useRouter();

  const [initialTurmas, setInitialTurmas] = useState([]);
  const [loadingTurmas, setLoadingTurmas] = useState(true);

  // Carrega do Firestore se localStorage estiver vazio, ou sync em background
  useEffect(() => {
    if (loading) return; // Aguarda o carregamento do estado de autenticação
    if (!user) {
      setLoadingTurmas(false);
      return;
    }

    (async () => {
      try {
        const storedUserId = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
        const isSameUser = storedUserId === user.uid;
        const local = isSameUser ? carregarLocal() : null;

        const ref = doc(db, 'professores', user.uid, 'turmas', 'data');
        const snap = await getDoc(ref);

        if (snap.exists() && snap.data().turmas?.length > 0) {
          const cloud = snap.data().turmas;
          setInitialTurmas(cloud);
          salvarLocal(cloud);
          if (typeof window !== 'undefined') localStorage.setItem(USER_KEY, user.uid);
        } else {
          // Sem dados no Firestore nem localStorage: migra do caminho antigo ou usa padrão
          const oldRef = doc(db, 'users', user.uid, 'turmas', 'data');
          const oldSnap = await getDoc(oldRef);
          if (oldSnap.exists() && oldSnap.data().turmas?.length > 0) {
            const oldData = oldSnap.data().turmas;
            await setDoc(ref, { turmas: oldData, updatedAt: serverTimestamp() }, { merge: true });
            setInitialTurmas(oldData);
            salvarLocal(oldData);
          } else {
            // Tenta do outro caminho antigo (campo turmas no próprio perfil do professor)
            const profRef = doc(db, 'professores', user.uid);
            const profSnap = await getDoc(profRef);
            if (profSnap.exists() && profSnap.data().turmas?.length > 0) {
              const oldData = profSnap.data().turmas;
              await setDoc(ref, { turmas: oldData, updatedAt: serverTimestamp() }, { merge: true });
              setInitialTurmas(oldData);
              salvarLocal(oldData);
            } else if (local && local.length > 0) {
              setInitialTurmas(local);
            } else {
              setInitialTurmas([]);
              salvarLocal([]);
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
          if (local) setInitialTurmas(local);
        }
      } finally {
        setLoadingTurmas(false);
      }
    })();
  }, [user, loading]);

  // Persiste no Firestore (subcoleção isolada) + localStorage
  const persistir = (novasTurmas) => {
    if (loadingTurmas) return; // CRÍTICO: Não persiste enquanto estiver carregando os dados iniciais do Firestore!
    salvarLocal(novasTurmas);
    setInitialTurmas(novasTurmas);
    if (typeof window !== 'undefined' && user) localStorage.setItem(USER_KEY, user.uid);
    if (!user) return;
    const ref = doc(db, 'professores', user.uid, 'turmas', 'data');
    setDoc(ref, { turmas: novasTurmas, updatedAt: serverTimestamp() }, { merge: true }).catch((e) => {
      console.error('Erro ao salvar turmas:', e);
    });
  };

  const { turmas, setTurmas, addTurma, removeTurma, addAlunos } = useTurmas(initialTurmas || [], persistir);
  const { addAtividade, removeAtividade, setNota } = useNotas(setTurmas);
  const atividadesHook = useAtividades(user?.uid);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [showAlunoDropdown, setShowAlunoDropdown] = useState(false);
  const [alunoLinkCopied, setAlunoLinkCopied] = useState(false);
  const alunoDropdownRef = useRef(null);
  const [showProfile, setShowProfile] = useState(false);
  const [viewMode, setViewMode] = useState('todas'); // 'turma' | 'todas'
  const [bimestre, setBimestre] = useState(() => {
    if (typeof window !== 'undefined') return Number(localStorage.getItem('atividades_bimestre')) || 1;
    return 1;
  });

  const handleSetBimestre = (b) => { setBimestre(b); localStorage.setItem('atividades_bimestre', b); };
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

  // Auth guard
  if (loading || loadingTurmas || (!perfil && user)) {
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

  if (
    !perfil?.modulos_permitidos?.includes('gerador-atividades') &&
    !perfil?.modulos_permitidos?.includes('diario-planejamento')
  ) {
    router.replace('/');
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar
        turmas={turmas}
        turmaSelecionada={viewMode === 'turma' ? turmaAtual : null}
        bimestreSelecionado={bimestre}
        user={user}
        onSelectTurma={(t) => { setTurmaSelecionada(t); setViewMode('turma'); }}
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
        <div className="flex-shrink-0 px-6 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between gap-3">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-200 hover:border-violet-300 transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            Hub
          </button>

          <div className="flex items-center gap-2">
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

            <button
              onClick={() => setViewMode('todas')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all
                ${viewMode === 'todas'
                  ? 'bg-violet-500 text-white'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
            >
              <Layers size={13} />
              Banco Completo
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {viewMode === 'todas' ? (
            <TodasAtividades
              turmas={turmas}
              user={user}
              useAtividadesHook={atividadesHook}
              onAddAtv={addAtividade}
              onRemoveAtv={removeAtividade}
              onSetNota={setNota}
            />
          ) : turmaAtual ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-violet-50 border border-violet-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-violet-500">
                  {bimestre}º Bimestre
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">
                Turma {turmaAtual.nome}
                <span className="text-xs text-slate-400 font-mono ml-2">({turmaAtual.alunos.length} alunos)</span>
              </h1>
              <AtividadesList
                turma={turmaAtual}
                bimestre={bimestre}
                turmas={turmas}
                useAtividadesHook={atividadesHook}
                onAddAtv={addAtividade}
                onRemoveAtv={removeAtividade}
                onSetNota={setNota}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4 opacity-20">📝</div>
                <p className="text-slate-800 font-semibold text-lg">Selecione uma turma</p>
                <p className="text-sm mt-1 text-slate-400">Escolha uma turma na barra lateral ou use o Banco Completo.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
