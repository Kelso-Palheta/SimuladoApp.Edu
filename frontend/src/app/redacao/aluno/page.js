"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validarLoginAluno } from '@/lib/firebase-aluno';
import { Search, ArrowRight, ShieldAlert, GraduationCap, PenTool } from 'lucide-react';

export default function AlunoRedacaoPage() {
  const [login, setLogin] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [vinculos, setVinculos] = useState(null);
  const [alunoData, setAlunoData] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valor = login.trim().toLowerCase();
    if (!valor) { setErro('Digite seu login.'); return; }

    setErro('');
    setLoading(true);

    try {
      const dados = await validarLoginAluno(valor);
      if (!dados) {
        setErro('Login não encontrado. Verifique seu nome e data de nascimento.');
        setLoading(false);
        return;
      }

      // Filtra apenas vínculos do módulo redação
      const redacaoVinculos = dados.vinculos.filter(v => v.modulo === 'redacao');

      if (redacaoVinculos.length === 0) {
        setErro('Nenhuma correção de redação encontrada para este login.');
        setLoading(false);
        return;
      }

      // Se só tem 1 professor, vai direto
      if (redacaoVinculos.length === 1) {
        const v = redacaoVinculos[0];
        sessionStorage.setItem('redacao_aluno', JSON.stringify({
          login: valor, nome: dados.nome,
          loginKey: dados.loginKey, professorUid: v.professorUid
        }));
        router.push(`/redacao/aluno/${dados.loginKey}`);
      } else {
        // Mostra lista de professores
        setAlunoData(dados);
        setVinculos(redacaoVinculos);
      }
    } catch (err) {
      console.error('Erro ao validar login:', err);
      setErro('Erro ao validar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfessor = (vinculo) => {
    sessionStorage.setItem('redacao_aluno', JSON.stringify({
      login: alunoData.login, nome: alunoData.nome,
      loginKey: alunoData.loginKey, professorUid: vinculo.professorUid
    }));
    router.push(`/redacao/aluno/${alunoData.loginKey}`);
  };

  // Tela de seleção de professor
  if (vinculos && vinculos.length > 1) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4"
        style={{ background: "linear-gradient(135deg, var(--primary) 0%, #7c3aed 40%, #2563eb 100%)" }}>
        <div className="glass-panel w-full max-w-sm p-8 space-y-5"
          style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
          <div className="text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: "var(--primary)" }}>
              <GraduationCap size={24} color="white" />
            </div>
            <h1 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{alunoData?.nome}</h1>
            <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              Selecione o professor para ver sua redação:
            </p>
          </div>

          <div className="space-y-2">
            {vinculos.map(v => (
              <button key={v.professorUid} onClick={() => handleSelectProfessor(v)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
                style={{ background: "var(--background)", color: "var(--foreground)", border: "1px solid var(--glass-border)" }}>
                <PenTool size={18} className="text-violet-400 flex-shrink-0" />
                <div>
                  <span className="font-semibold">{v.nomeProfessor || 'Professor'}</span>
                  <span className="text-xs opacity-50 block">Turma {v.turmaId}</span>
                </div>
                <ArrowRight size={16} className="ml-auto opacity-30" />
              </button>
            ))}
          </div>

          <button onClick={() => { setVinculos(null); setAlunoData(null); setLogin(''); }}
            className="w-full text-xs text-center opacity-50 hover:opacity-80" style={{ color: "var(--foreground)" }}>
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  // Tela de login
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, var(--primary) 0%, #7c3aed 40%, #2563eb 100%)" }}>
      <div className="glass-panel w-full max-w-sm p-8 space-y-6 text-center"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--primary)" }}>
          <Search size={24} color="white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Minha Redação</h1>
          <p className="text-sm mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            Digite seu login para ver sua correção.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" value={login}
            onChange={e => { setLogin(e.target.value); setErro(''); }}
            placeholder="Ex: maria0704" autoFocus
            className="w-full px-4 py-3 rounded-xl text-center text-lg font-mono font-bold outline-none transition-all focus:ring-2"
            style={{ background: "var(--background)", color: "var(--foreground)", border: "1px solid var(--glass-border)" }} />
          <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>
            Seu primeiro nome + dia e mês de nascimento.<br />
            Exemplo: MARIA SILVA nascida em 07/04 → <strong>maria0704</strong>
          </p>
          {erro && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 bg-red-50/10 border border-red-400/20">
              <ShieldAlert size={14} /> {erro}
            </div>
          )}
          <button type="submit" disabled={!login.trim() || loading}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            {loading ? 'Buscando...' : <><ArrowRight size={16} /> Ver Correção</>}
          </button>
        </form>
      </div>
    </div>
  );
}
