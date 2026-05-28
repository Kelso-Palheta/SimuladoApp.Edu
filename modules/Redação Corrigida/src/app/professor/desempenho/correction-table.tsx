'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  ArrowRight,
  Trash2,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface CorrectionTableProps {
  corrections: any[];
}

export default function CorrectionTable({ corrections }: CorrectionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredCorrections = corrections.filter(c => 
    c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.studentClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.essayTheme.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta correção?')) return;

    setDeletingId(id);
    try {
      const userJson = localStorage.getItem('prof_user');
      if (!userJson) throw new Error('Usuário não logado');
      const user = JSON.parse(userJson);

      const res = await fetch(`/api/correcao/excluir/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id })
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao excluir correção.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir correção.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="p-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <h3 className="text-lg font-bold">Histórico de Correções</h3>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
          <input 
            type="text" 
            placeholder="Buscar aluno, turma ou tema..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2 bg-neutral-950 border border-white/10 rounded-xl text-sm outline-none focus:border-violet-500/50 transition-all text-white"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold border-b border-white/5">
              <th className="px-8 py-4">Data</th>
              <th className="px-6 py-4">Aluno / Turma</th>
              <th className="px-6 py-4">Tema</th>
              <th className="px-6 py-4">Nota</th>
              <th className="px-6 py-4">ID de Acesso</th>
              <th className="px-8 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredCorrections.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center text-neutral-600 font-medium italic">
                  {searchTerm ? 'Nenhum resultado encontrado para sua busca.' : 'Nenhuma correção encontrada.'}
                </td>
              </tr>
            ) : (
              filteredCorrections.map((c) => (
                <tr key={c.id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-neutral-400 text-sm">
                      <Calendar size={14} />
                      {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-bold text-white">{c.studentName}</div>
                    <div className="text-xs text-neutral-500">{c.studentClass}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm text-neutral-300 truncate max-w-[200px]" title={c.essayTheme}>
                      {c.essayTheme}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`text-lg font-black ${c.totalScore >= 800 ? 'text-emerald-400' : c.totalScore >= 600 ? 'text-violet-400' : 'text-yellow-500'}`}>
                      {c.totalScore}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg font-mono text-xs font-bold text-neutral-400">
                      {c.id}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="p-2 inline-flex items-center justify-center bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-neutral-500 rounded-lg transition-all disabled:opacity-50"
                        title="Excluir"
                      >
                        {deletingId === c.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                      <Link 
                        href={`/aluno/${c.id}?from=professor`} 
                        className="p-2 inline-flex items-center justify-center bg-white/5 hover:bg-violet-600/20 hover:text-violet-400 text-neutral-500 rounded-lg transition-all"
                        title="Ver Detalhes"
                      >
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
