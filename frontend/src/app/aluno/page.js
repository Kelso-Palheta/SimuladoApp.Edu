"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validarLoginAluno } from '@/lib/firebase-aluno';

export default function AlunoLoginPage() {
  const [login, setLogin] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [vinculos, setVinculos] = useState(null);
  const [alunoBase, setAlunoBase] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valor = login.trim().toLowerCase();
    if (!valor) return;

    setErro('');
    setLoading(true);

    try {
      const dados = await validarLoginAluno(valor);
      if (!dados) {
        setErro('Login não encontrado. Verifique seu nome e data de nascimento.');
        setLoading(false);
        return;
      }

      if (!dados.vinculos || dados.vinculos.length === 0) {
        setErro('Nenhuma nota ou atividade vinculada a esta conta ainda.');
        setLoading(false);
        return;
      }

      // Se tiver apenas 1 vínculo, faz login direto nele
      if (dados.vinculos.length === 1) {
        const v = dados.vinculos[0];
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('aluno_login', JSON.stringify({
            login: valor,
            nome: dados.nome,
            alunoId: v.alunoId || dados.loginKey,
            turmaId: v.turmaId,
            professorUid: v.professorUid
          }));
        }
        if (v.modulo === 'redacao') {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('redacao_aluno', JSON.stringify({
              professorUid: v.professorUid
            }));
          }
          router.push(`/redacao/aluno/${v.alunoId || dados.loginKey}`);
        } else {
          router.push('/aluno/notas');
        }
      } else {
        // Se tiver múltiplos vínculos, exibe a lista para seleção
        setAlunoBase({ login: valor, nome: dados.nome, loginKey: dados.loginKey });
        setVinculos(dados.vinculos);
      }
    } catch (err) {
      console.error('Erro ao validar login:', err);
      setErro('Erro ao validar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVinculo = (v) => {
    if (!alunoBase) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('aluno_login', JSON.stringify({
        login: alunoBase.login,
        nome: alunoBase.nome,
        alunoId: v.alunoId || alunoBase.loginKey,
        turmaId: v.turmaId,
        professorUid: v.professorUid
      }));
    }
    if (v.modulo === 'redacao') {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redacao_aluno', JSON.stringify({
          professorUid: v.professorUid
        }));
      }
      router.push(`/redacao/aluno/${v.alunoId || alunoBase.loginKey}`);
    } else {
      router.push('/aluno/notas');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4"
      style={{
        backgroundImage: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(99,102,241,0.06), transparent)',
      }}
    >
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-8 animate-card-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-violet-700 to-violet-400 flex items-center justify-center text-white text-xl font-extrabold shadow-lg shadow-violet-500/20">
            N
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Portal do Aluno</h1>
          <p className="text-xs text-slate-400 mt-1">
            Acesse suas notas, redações e simulados
          </p>
        </div>

        {vinculos ? (
          <div className="space-y-4">
            <div className="text-left bg-violet-50/50 border border-violet-100 p-4 rounded-2xl mb-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Aluno(a) Identificado(a)</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{alunoBase?.nome}</p>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-left">Selecione uma matéria ou professor:</p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {vinculos.map((v) => (
                <button
                  key={v.id || v.professorUid}
                  onClick={() => handleSelectVinculo(v)}
                  className="w-full text-left p-4 bg-slate-50 hover:bg-violet-50 hover:border-violet-300 border border-slate-200/80 rounded-2xl transition-all duration-300 flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-800 text-sm truncate">{v.nomeProfessor}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      Turma: {v.turmaNome || v.turmaId} • {v.modulo === 'redacao' ? 'Redação' : 'Diário Pedagógico'}
                    </p>
                  </div>
                  <span className="text-violet-500 font-bold text-sm transform transition-transform group-hover:translate-x-1">→</span>
                </button>
              ))}
            </div>
            <button onClick={() => { setVinculos(null); setAlunoBase(null); }} className="w-full text-center mt-4 text-xs text-slate-400 hover:text-slate-600 underline font-medium">
              Entrar com outra conta
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-left">
                Login do Aluno
              </label>
              <input
                type="text"
                value={login}
                onChange={(e) => { setLogin(e.target.value); setErro(''); }}
                placeholder="Ex: kelso0407"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-violet-400/50 transition-all duration-300 font-mono"
                autoFocus
                disabled={loading}
              />
              <p className="text-xs text-slate-400 mt-2 text-left leading-relaxed">
                Insira seu primeiro nome + dia e mês de nascimento.<br />
                Exemplo: KELSO PALHETA nascido em 07/04 → <strong>kelso0407</strong>
              </p>
            </div>

            {erro && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-left">
                <p className="text-xs text-red-500 font-medium">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!login.trim() || loading}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-2xl text-white text-sm font-bold transition-all shadow-md shadow-violet-500/10"
            >
              {loading ? 'Verificando...' : 'Acessar Notas'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
