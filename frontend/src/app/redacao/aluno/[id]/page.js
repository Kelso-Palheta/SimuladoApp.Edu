"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { generatePDF } from '@/lib/redacao/pdf-generator';
import { ArrowLeft, Download, Search, FileText, User, BookOpen, Calendar } from 'lucide-react';

export default function AlunoRedacaoViewPage() {
  const { id } = useParams();
  const [correction, setCorrection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        // Obtém sessionStorage para pegar professorUid
        let professorUid = null;
        if (typeof window !== 'undefined') {
          const raw = sessionStorage.getItem('redacao_aluno');
          if (raw) {
            try { const data = JSON.parse(raw); professorUid = data.professorUid; } catch {}
          }
        }

        // Tenta buscar com professorUid (mais rápido)
        if (professorUid) {
          const ref = doc(db, 'professores', professorUid, 'correcoes', id);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setCorrection(snap.data());
            setLoading(false);
            return;
          }
        }

        // Fallback: busca no alunoLogin para achar o professorUid
        const loginSnap = await getDoc(doc(db, 'alunoLogin', id));
        if (loginSnap.exists()) {
          const loginData = loginSnap.data();
          professorUid = loginData.professorUid;
          if (professorUid) {
            const ref = doc(db, 'professores', professorUid, 'correcoes', id);
            const snap = await getDoc(ref);
            if (snap.exists()) {
              setCorrection(snap.data());
              setLoading(false);
              return;
            }
          }
        }

        setErro('Correção não encontrada. Verifique seu login.');
      } catch (err) {
        console.error('Erro ao buscar correção:', err);
        setErro('Erro ao carregar. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleExportPDF = () => {
    if (correction?.result) {
      generatePDF(
        correction.result,
        correction.studentName,
        correction.studentClass,
        correction.essayTheme,
        correction.scoreData
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-700 to-violet-400 animate-pulse" />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm animate-card-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
            <Search size={28} className="text-red-400" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 mb-2">Não encontrado</h1>
          <p className="text-sm text-slate-400 mb-6">{erro}</p>
          <a href="/redacao/aluno" className="text-sm text-violet-500 hover:text-violet-400 font-medium">← Tentar outro login</a>
        </div>
      </div>
    );
  }

  const scores = correction?.scoreData?.map((item, i) => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
    return { ...item, color: colors[i] || '#6366f1' };
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <a href="/redacao/aluno" className="inline-flex items-center gap-1.5 text-sm text-violet-500 hover:text-violet-400 font-medium transition-colors">
            <ArrowLeft size={16} /> Buscar outro login
          </a>
          <button onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-xl text-xs font-semibold text-violet-600 transition-all">
            <Download size={14} /> Baixar PDF
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
          <span className="flex items-center gap-1.5"><User size={14} /> {correction.studentName}</span>
          {correction.studentClass !== 'N/A' && <span className="flex items-center gap-1.5"><BookOpen size={14} /> Turma {correction.studentClass}</span>}
          <span className="flex items-center gap-1.5"><FileText size={14} /> Tema: {correction.essayTheme}</span>
          {correction.createdAt && (
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {correction.createdAt.toDate?.().toLocaleDateString('pt-BR') || ''}</span>
          )}
        </div>

        {correction.totalScore != null && (
          <div className="glass-panel p-6 text-center mb-6">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Nota Final</p>
            <span className={`text-6xl font-black tracking-tighter tabular-nums ${correction.totalScore >= 600 ? 'text-green-500' : correction.totalScore >= 400 ? 'text-amber-500' : 'text-red-500'}`}>
              {correction.totalScore}
            </span>
            <span className="text-xl text-slate-400 font-bold ml-1">/ 1000</span>
          </div>
        )}

        {scores?.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mb-6">
            {scores.map((item, i) => (
              <div key={i} className="glass-panel p-3 text-center">
                <p className="text-[10px] text-slate-400 font-semibold mb-1">{item.subject}</p>
                <span className="text-xl font-black tabular-nums" style={{ color: item.color }}>{item.A}</span>
                <span className="text-[10px] text-slate-400">/200</span>
              </div>
            ))}
          </div>
        )}

        <div className="glass-panel p-6">
          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
            {correction.result}
          </div>
        </div>
      </div>
    </div>
  );
}
