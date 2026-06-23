"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { gerarLoginKey, gerarLoginAluno } from '@/utils/diario/loginAluno';
import { ArrowLeft, BarChart3, Users, TrendingUp, Award, Trash2, Search, ExternalLink, Link2, Shield, AlertCircle } from 'lucide-react';

export default function DesempenhoPage() {
  const { user, perfil, loading: authLoading } = useAuth();
  const router = useRouter();

  const [corrections, setCorrections] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [claimLogin, setClaimLogin] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState('');
  const [syncStatus, setSyncStatus] = useState('');

  // 1. Carrega as turmas do diário
  useEffect(() => {
    if (!user) return;
    const loadTurmas = async () => {
      try {
        const ref = doc(db, 'professores', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().turmas) {
          setTurmas(snap.data().turmas);
        }
      } catch (err) {
        console.error('Erro ao carregar turmas no desempenho:', err);
      }
    };
    loadTurmas();
  }, [user]);

  // 2. Carrega as correções
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const q = query(
          collection(db, 'professores', user.uid, 'correcoes'),
          where('userId', '==', user.uid)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ ...d.data(), _firestoreId: d.id }));
        list.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
        setCorrections(list);
      } catch (err) {
        console.error('Erro ao carregar correções:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // 3. Sincroniza logins automaticamente com base nas datas de nascimento do Diário Pedagógico
  useEffect(() => {
    if (!user || loading || turmas.length === 0 || corrections.length === 0) return;

    const migrarLogins = async () => {
      let mudou = false;
      const novasCorrecoes = [...corrections];
      setSyncStatus('Sincronizando logins...');

      for (let i = 0; i < novasCorrecoes.length; i++) {
        const c = novasCorrecoes[i];
        let alunoEncontrado = null;
        let turmaDoAluno = null;

        // Encontra o aluno correspondente nas turmas do diário (busca por nome exato)
        for (const t of turmas) {
          const al = t.alunos?.find(a => a.nome.trim().toLowerCase() === c.studentName.trim().toLowerCase());
          if (al) {
            alunoEncontrado = al;
            turmaDoAluno = t;
            break;
          }
        }

        if (alunoEncontrado && alunoEncontrado.dataNascimento) {
          const targetLogin = gerarLoginAluno(alunoEncontrado.nome, alunoEncontrado.dataNascimento);
          const targetKey = await gerarLoginKey(targetLogin);

          // Se o login ou ID da correção for diferente do esperado
          if (c.loginAluno !== targetLogin || c.id !== targetKey) {
            try {
              const oldId = c._firestoreId || c.id;
              const newCorrData = {
                ...c,
                id: targetKey,
                loginAluno: targetLogin,
                studentClass: turmaDoAluno.nome,
                _firestoreId: targetKey
              };

              // Salva com a nova chave e atualiza
              await setDoc(doc(db, 'professores', user.uid, 'correcoes', targetKey), newCorrData);

              // Remove o documento sob o ID antigo
              if (oldId !== targetKey) {
                await deleteDoc(doc(db, 'professores', user.uid, 'correcoes', oldId));
              }

              // Cria ou atualiza o vínculo de login do aluno
              await setDoc(doc(db, 'alunoLogin', targetKey, 'vinculos', user.uid), {
                professorUid: user.uid,
                turmaId: turmaDoAluno.nome || 'N/A',
                modulo: 'redacao',
                nomeProfessor: perfil?.nome || user?.displayName || 'Professor'
              }, { merge: true });

              novasCorrecoes[i] = newCorrData;
              mudou = true;
            } catch (err) {
              console.error('Erro ao sincronizar login:', err);
            }
          }
        }
      }

      if (mudou) {
        setCorrections(novasCorrecoes);
      }
      setSyncStatus('');
    };

    migrarLogins();
  }, [user, turmas, corrections, loading, perfil]);

  const handleClaim = async () => {
    const login = claimLogin.trim().toLowerCase();
    if (!login) return;
    setClaiming(true);
    setClaimMsg('');

    try {
      const loginKey = await gerarLoginKey(login);

      // Busca em todos os professores
      const professoresSnap = await getDocs(collection(db, 'professores'));
      let found = null;
      let foundProfessorUid = null;

      for (const profDoc of professoresSnap.docs) {
        const corrRef = doc(db, 'professores', profDoc.id, 'correcoes', loginKey);
        const corrSnap = await getDoc(corrRef);
        if (corrSnap.exists()) {
          found = corrSnap.data();
          foundProfessorUid = profDoc.id;
          break;
        }
      }

      if (!found) {
        // Tenta buscar por loginAluno (formato antigo)
        for (const profDoc of professoresSnap.docs) {
          const qSnap = await getDocs(query(
            collection(db, 'professores', profDoc.id, 'correcoes'),
            where('loginAluno', '==', login)
          ));
          if (!qSnap.empty) {
            const docData = qSnap.docs[0].data();
            found = docData;
            foundProfessorUid = profDoc.id;
            break;
          }
        }
      }

      if (!found) {
        setClaimMsg('Correção não encontrada. Verifique o login do aluno.');
      } else if (foundProfessorUid === user.uid) {
        setClaimMsg('Esta correção já está no seu histórico.');
      } else {
        // Copia para o professor atual
        const corrData = { ...found, userId: user.uid, id: loginKey };
        await setDoc(doc(db, 'professores', user.uid, 'correcoes', loginKey), corrData);

        // Cria vínculo
        await setDoc(doc(db, 'alunoLogin', loginKey, 'vinculos', user.uid), {
          professorUid: user.uid,
          turmaId: found.studentClass || 'N/A',
          modulo: 'redacao',
          nomeProfessor: perfil?.nome || user?.displayName || 'Professor'
        }, { merge: true });

        setClaimMsg(`✅ Correção de "${found.studentName}" vinculada com sucesso!`);
        setClaimLogin('');
        
        // Recarrega a lista
        const q = query(collection(db, 'professores', user.uid, 'correcoes'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ ...d.data(), _firestoreId: d.id }));
        list.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
        setCorrections(list);
      }
    } catch (err) {
      setClaimMsg('Erro: ' + err.message);
    } finally {
      setClaiming(false);
    }
  };

  if (authLoading || (!perfil && user)) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 animate-pulse shadow-2xl shadow-violet-500/20" />
      </div>
    );
  }

  if (!user) {
    router.replace('/');
    return null;
  }

  const filtered = corrections.filter(c =>
    !search || c.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    c.studentClass?.toLowerCase().includes(search.toLowerCase()) ||
    c.essayTheme?.toLowerCase().includes(search.toLowerCase()) ||
    c.id?.toLowerCase().includes(search.toLowerCase())
  );

  const total = corrections.length;
  const avgScore = total > 0 ? Math.round(corrections.reduce((s, c) => s + (c.totalScore || 0), 0) / total) : 0;
  const maxScore = total > 0 ? Math.max(...corrections.map(c => c.totalScore || 0)) : 0;

  const formatarData = (timestamp) => {
    if (!timestamp) return '—';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '—';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir esta correção permanentemente?')) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, 'professores', user.uid, 'correcoes', id));
      setCorrections(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans"
      style={{
        backgroundImage: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(99,102,241,0.06), transparent), radial-gradient(ellipse 60% 60% at 100% 100%, rgba(99,102,241,0.03), transparent)',
      }}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/redacao')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-200/50 hover:border-violet-300 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm">
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <h1 className="text-base font-bold text-slate-800 flex items-center gap-2 tracking-tight">
            <BarChart3 size={18} className="text-violet-500" /> Minhas Correções
          </h1>
        </div>
        {syncStatus && (
          <span className="text-xs text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full animate-pulse font-medium">
            🔄 {syncStatus}
          </span>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 space-y-6">
        
        {/* Stats Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-6 rounded-2xl shadow-sm flex items-center gap-4 transition-transform duration-300 hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100"><Users size={22} className="text-blue-500" /></div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Corrigido</p>
              <p className="text-3xl font-black text-slate-900 tabular-nums tracking-tight">{total}</p>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-6 rounded-2xl shadow-sm flex items-center gap-4 transition-transform duration-300 hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100"><TrendingUp size={22} className="text-amber-500" /></div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Média Geral</p>
              <p className="text-3xl font-black text-slate-900 tabular-nums tracking-tight">{avgScore}</p>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-6 rounded-2xl shadow-sm flex items-center gap-4 transition-transform duration-300 hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100"><Award size={22} className="text-emerald-500" /></div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Maior Nota</p>
              <p className="text-3xl font-black text-slate-900 tabular-nums tracking-tight">{maxScore}</p>
            </div>
          </div>
        </div>

        {/* Vincular Correção & Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vincular */}
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-violet-50 rounded-lg"><Link2 size={16} className="text-violet-500" /></div>
              <h3 className="text-sm font-bold text-slate-800">Vincular Correção</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">Vincule a correção de um aluno informando o login cadastrado (Ex: nome + data de nascimento).</p>
            <div className="space-y-2">
              <input
                value={claimLogin}
                onChange={e => { setClaimLogin(e.target.value); setClaimMsg(''); }}
                onKeyDown={e => e.key === 'Enter' && handleClaim()}
                placeholder="Ex: maria0704"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-violet-400/50 transition-all font-mono"
              />
              <button onClick={handleClaim} disabled={claiming || !claimLogin.trim()}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl text-white text-xs font-bold transition-all shadow-sm">
                {claiming ? 'Vinculando...' : 'Vincular à Conta'}
              </button>
            </div>
            {claimMsg && (
              <div className={`p-3 rounded-xl border text-xs flex gap-2 items-start ${claimMsg.startsWith('✅') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span className="font-medium">{claimMsg}</span>
              </div>
            )}
          </div>

          {/* Lista & Busca */}
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-4 md:col-span-2 flex flex-col">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-violet-50 rounded-lg"><Search size={16} className="text-violet-500" /></div>
                <h3 className="text-sm font-bold text-slate-800">Filtrar Histórico</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{filtered.length} encontradas</span>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome do aluno, turma, tema ou ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-violet-400/50 transition-all" />
            </div>

            <div className="flex-1 overflow-hidden min-h-[300px] flex flex-col justify-between">
              {loading ? (
                <div className="space-y-3 py-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100/65 rounded-xl animate-pulse" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 flex-1 flex flex-col items-center justify-center">
                  <div className="text-4xl mb-2 opacity-30">📂</div>
                  <p className="text-slate-400 text-sm font-medium">{search ? 'Nenhum resultado encontrado.' : 'Nenhuma correção realizada ainda.'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/75">
                        <th className="text-left px-4 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aluno</th>
                        <th className="text-left px-4 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data</th>
                        <th className="text-left px-4 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Turma</th>
                        <th className="text-left px-4 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tema</th>
                        <th className="text-center px-4 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nota</th>
                        <th className="text-center px-4 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Login</th>
                        <th className="text-right px-4 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-4 py-3 font-semibold text-slate-800">{c.studentName}</td>
                          <td className="px-4 py-3 text-xs text-slate-500 font-medium">{formatarData(c.createdAt)}</td>
                          <td className="px-4 py-3 text-xs text-slate-500 font-medium">{c.studentClass}</td>
                          <td className="px-4 py-3 text-xs text-slate-400 truncate max-w-[160px]" title={c.essayTheme}>{c.essayTheme}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex font-mono font-bold text-xs px-2.5 py-1 rounded-lg border shadow-sm
                              ${(c.totalScore || 0) >= 600
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                : (c.totalScore || 0) >= 400
                                  ? 'bg-amber-50 border-amber-100 text-amber-600'
                                  : 'bg-rose-50 border-rose-100 text-rose-500'}`}>
                              {c.totalScore || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
                              <Shield size={10} /> {c.loginAluno || c.id.substring(0, 8)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <a href={`/redacao/aluno/${c.id}`} target="_blank" rel="noopener noreferrer"
                                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-violet-500 rounded-xl transition-all"
                                title="Abrir página do aluno"
                              >
                                <ExternalLink size={14} />
                              </a>
                              <button onClick={() => handleDelete(c._firestoreId || c.id)} disabled={deleting === c.id}
                                className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                                title="Excluir"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
