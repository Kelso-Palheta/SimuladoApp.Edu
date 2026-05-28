'use client';

import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import CorrectionTable from './correction-table';
import { Correction } from '@/lib/storage';

export default function ProfessorDashboard() {
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, average: 0, topScore: 0 });

  useEffect(() => {
    const userJson = localStorage.getItem('prof_user');
    if (!userJson) {
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userJson);
      const userId = user.id;

      fetch(`/api/correcao/usuario/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const sorted = [...data].sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setCorrections(sorted);
            
            const total = data.length;
            const average = data.length > 0 
              ? Math.round(data.reduce((acc, curr) => acc + curr.totalScore, 0) / data.length) 
              : 0;
            const topScore = data.length > 0 ? Math.max(...data.map(c => c.totalScore)) : 0;
            
            setStats({ total, average, topScore });
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Erro ao buscar correções:", err);
          setLoading(false);
        });
    } catch (e) {
      console.error("Erro ao processar dados do usuário:", e);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-violet-400" size={40} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8 md:py-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-violet-400" size={32} />
            Minhas Correções
          </h2>
          <p className="text-neutral-400 mt-2 font-medium">Acompanhe seu histórico de análises e gerencie suas correções.</p>
        </div>
        <Link href="/professor" className="px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-2xl text-sm font-bold shadow-lg shadow-violet-600/20 transition-all flex items-center gap-2 text-white">
          Nova Correção <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl border border-white/5 bg-neutral-900/40 space-y-2">
          <div className="flex justify-between items-start">
            <Users size={20} className="text-violet-400" />
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Total Alunos</span>
          </div>
          <div className="text-4xl font-black text-white">{stats.total}</div>
        </div>
        <div className="glass p-6 rounded-3xl border border-white/5 bg-neutral-900/40 space-y-2">
          <div className="flex justify-between items-start">
            <TrendingUp size={20} className="text-emerald-400" />
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Média Geral</span>
          </div>
          <div className="text-4xl font-black text-white">{stats.average} <span className="text-sm text-neutral-500">pts</span></div>
        </div>
        <div className="glass p-6 rounded-3xl border border-white/5 bg-neutral-900/40 space-y-2">
          <div className="flex justify-between items-start">
            <Award size={20} className="text-yellow-500" />
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Maior Nota</span>
          </div>
          <div className="text-4xl font-black text-white">{stats.topScore} <span className="text-sm text-neutral-500">pts</span></div>
        </div>
      </div>

      <ClaimCorrectionForm onClaimSuccess={() => window.location.reload()} />

      <div className="glass rounded-[2.5rem] border border-white/5 bg-neutral-900/20 overflow-hidden">
        <CorrectionTable corrections={corrections} />
      </div>
    </div>
  );
}

function ClaimCorrectionForm({ onClaimSuccess }: { onClaimSuccess: () => void }) {
  const [code, setCode] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setClaiming(true);
    setMessage(null);

    try {
      const userJson = localStorage.getItem('prof_user');
      if (!userJson) throw new Error('Usuário não logado');
      const user = JSON.parse(userJson);

      const res = await fetch('/api/correcao/reivindicar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correctionId: code, userId: user.id })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Correção vinculada com sucesso!' });
        setCode('');
        setTimeout(onClaimSuccess, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao vincular correção.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro inesperado.' });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="glass p-8 rounded-3xl border border-white/5 bg-neutral-900/40">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Vincular correção antiga</h3>
          <p className="text-sm text-neutral-400">Insira o código da correção (ex: ABCD-1234) para adicioná-la ao seu histórico.</p>
        </div>
        
        <form onSubmit={handleClaim} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="CÓDIGO-ID"
            className="flex-1 md:w-48 bg-neutral-800 border border-white/10 rounded-xl px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-violet-500 transition-colors"
          />
          <button
            type="submit"
            disabled={claiming}
            className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold border border-white/10 transition-all flex items-center gap-2"
          >
            {claiming ? <Loader2 className="animate-spin" size={16} /> : 'Vincular'}
          </button>
        </form>
      </div>
      
      {message && (
        <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
