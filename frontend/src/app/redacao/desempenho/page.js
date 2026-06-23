"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { gerarLoginKey } from '@/utils/diario/loginAluno';
import { ArrowLeft, BarChart3, Users, TrendingUp, Award, Trash2, Search, ExternalLink, Link2 } from 'lucide-react';

export default function DesempenhoPage() {
  const { user, perfil, loading: authLoading } = useAuth();
  const router = useRouter();

  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [claimLogin, setClaimLogin] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState('');

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
            // Re-save com a nova loginKey
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

  if (authLoading || (!perfil && user)) {
    return <div className="flex h-screen items-center justify-center"><div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-700 to-violet-400 animate-pulse" /></div>;
  }
  if (!user) { router.replace('/'); return null; }

  const filtered = corrections.filter(c =>
    !search || c.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    c.studentClass?.toLowerCase().includes(search.toLowerCase()) ||
    c.essayTheme?.toLowerCase().includes(search.toLowerCase()) ||
    c.id?.toLowerCase().includes(search.toLowerCase())
  );

  const total = corrections.length;
  const avgScore = total > 0 ? Math.round(corrections.reduce((s, c) => s + (c.totalScore || 0), 0) / total) : 0;
  const maxScore = total > 0 ? Math.max(...corrections.map(c => c.totalScore || 0)) : 0;

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir esta correção?')) return;
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => router.push('/redacao')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-200 hover:border-violet-300 transition-all shadow-sm">
          <ArrowLeft size={16} /> Voltar
        </button>
        <h1 className="text-sm font-semibold text-slate-700 flex items-center gap-2"><BarChart3 size={16} /> Desempenho</h1>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Vincular correção */}
        <div className="glass-panel p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Link2 size={16} className="text-violet-500" />
            <h3 className="text-sm font-semibold text-slate-700">Vincular correção</h3>
          </div>
          <p className="text-xs text-slate-400 mb-3">Insira o login do aluno (primeiro nome + dia/mês de nascimento) para vincular a correção ao seu histórico.</p>
          <div className="flex gap-2">
            <input
              value={claimLogin}
              onChange={e => { setClaimLogin(e.target.value); setClaimMsg(''); }}
              onKeyDown={e => e.key === 'Enter' && handleClaim()}
              placeholder="Ex: maria0704"
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 placeholder-slate-300 outline-none focus:ring-2 focus:ring-violet-400/50 transition-all font-mono"
            />
            <button onClick={handleClaim} disabled={claiming || !claimLogin.trim()}
              className="px-4 py-2 bg-violet-500 hover:bg-violet-400 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl text-white text-sm font-semibold transition-all">
              {claiming ? 'Vinculando...' : 'Vincular'}
            </button>
          </div>
          {claimMsg && (
            <p className={`text-xs mt-2 ${claimMsg.startsWith('✅') ? 'text-green-600' : claimMsg.startsWith('Erro') ? 'text-red-500' : 'text-amber-500'}`}>
              {claimMsg}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-panel p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Users size={20} className="text-blue-500" /></div>
            <div><p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total de Redações</p><p className="text-2xl font-black text-slate-900 tabular-nums">{total}</p></div>
          </div>
          <div className="glass-panel p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><TrendingUp size={20} className="text-amber-500" /></div>
            <div><p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Média Geral</p><p className="text-2xl font-black text-slate-900 tabular-nums">{avgScore}</p></div>
          </div>
          <div className="glass-panel p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><Award size={20} className="text-green-500" /></div>
            <div><p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Maior Nota</p><p className="text-2xl font-black text-slate-900 tabular-nums">{maxScore}</p></div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, turma, tema ou ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-400/50 transition-all" />
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16"><p className="text-slate-400">{search ? 'Nenhum resultado encontrado.' : 'Nenhuma correção realizada ainda.'}</p></div>
        ) : (
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aluno</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Turma</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tema</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nota</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Login</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{c.studentName}</td>
                      <td className="px-4 py-3 text-slate-500">{c.studentClass}</td>
                      <td className="px-4 py-3 text-slate-500 truncate max-w-[200px]">{c.essayTheme}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex font-mono font-bold text-sm px-2 py-0.5 rounded ${(c.totalScore || 0) >= 600 ? 'bg-green-50 text-green-600' : (c.totalScore || 0) >= 400 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'}`}>
                          {c.totalScore || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-xs text-violet-600">{c.loginAluno || c.id}</td>
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                        <a href={`/redacao/aluno/${c.id}`} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-violet-500 transition-colors"><ExternalLink size={14} /></a>
                        <button onClick={() => handleDelete(c._firestoreId || c.id)} disabled={deleting === c.id}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
