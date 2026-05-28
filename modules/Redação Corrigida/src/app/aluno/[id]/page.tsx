'use client';

import React, { useEffect, useState } from 'react';
import { 
  Zap,
  Trophy,
  Calendar,
  ArrowLeft,
  FileQuestion,
  Download,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { generatePDF } from '@/lib/pdf-generator';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip 
} from 'recharts';

interface Correction {
  id: string;
  studentName: string;
  studentClass: string;
  essayTheme: string;
  result: string;
  scoreData: any[];
  totalScore: number;
  createdAt: string;
}

export default function StudentResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const correctionId = params.id as string;
  const [correction, setCorrection] = useState<Correction | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    fetch(`/api/correcao/${correctionId}`)
      .then(res => {
        if (!res.ok) { setNotFound(true); setLoading(false); return null; }
        return res.json();
      })
      .then(data => {
        if (data) { setCorrection(data); }
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [correctionId]);

  const handleDownloadPdf = () => {
    if (!correction) return;
    setIsGeneratingPdf(true);
    try {
      generatePDF(correction.result, correction.studentName, correction.studentClass, correction.essayTheme, correction.scoreData);
    } catch(e) { console.error(e); }
    setTimeout(() => setIsGeneratingPdf(false), 1500);
  };

  const renderMarkdown = (text: string) => {
    const clean = text
      .replace(/```json[\s\S]*?```/g, '')
      .replace(/\{[\s]*?"c1"[\s\S]*?\}/g, '')
      .replace(/^[| \-:]+[| \-:]+$/gm, '')
      .replace(/\|/g, ' ')
      .trim();
    
    return clean.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-4" />;
      if (/^###\s/.test(trimmed)) return <h3 key={i} className="text-lg font-bold text-violet-400 mt-6 mb-2 pb-1 border-b border-violet-500/20">{trimmed.replace(/^###\s/, '')}</h3>;
      if (/^##\s/.test(trimmed)) return <h2 key={i} className="text-xl font-extrabold text-white mt-8 mb-4">{trimmed.replace(/^##\s/, '')}</h2>;
      
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const rendered = parts.map((part, j) => {
        if (/^\*\*.*\*\*$/.test(part)) return <strong key={j} className="text-violet-200 font-bold">{part.slice(2, -2)}</strong>;
        return part;
      });
      
      if (/^[-*•▸]\s/.test(trimmed)) return (
        <div key={i} className="flex gap-3 items-start py-1 px-2 -ml-2 rounded-lg hover:bg-white/5 transition-all">
          <span className="text-violet-500 mt-1 shrink-0">●</span>
          <p className="text-neutral-300 text-[15px] leading-relaxed font-medium">{rendered.map((r, k) => typeof r === 'string' ? r.replace(/^[-*•▸]\s?/, '') : r)}</p>
        </div>
      );
      return <p key={i} className="text-neutral-300 text-[15px] leading-relaxed py-1 px-1 font-medium">{rendered}</p>;
    });
  };

  const backLink = from === 'professor' ? '/professor/desempenho' : '/aluno';
  const backText = from === 'professor' ? 'Voltar ao Painel' : 'Voltar ao Portal';

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin text-violet-400" />
      </div>
    );
  }

  if (notFound || !correction) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <FileQuestion size={40} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Correção não encontrada</h2>
        <p className="text-neutral-400 mb-8 max-w-sm">O ID &quot;{correctionId}&quot; não existe ou foi digitado incorretamente.</p>
        <Link href="/aluno" className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-sm font-bold transition-all">Voltar ao Portal</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10 pb-10">
        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-600 blur-2xl opacity-30"></div>
            <div className="relative text-7xl font-black text-white drop-shadow-2xl">{correction.totalScore}</div>
            <p className="text-xs uppercase font-bold text-violet-400 tracking-widest text-center mt-1">Pontos</p>
          </div>
          <div>
            <h2 className="text-4xl font-black text-white mb-2">{correction.studentName}</h2>
            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
              <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-neutral-400 flex items-center gap-2">
                <Trophy size={12} className="text-yellow-500" /> {correction.studentClass}
              </span>
              <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-neutral-400 flex items-center gap-2">
                <Calendar size={12} /> {new Date(correction.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <p className="mt-3 text-neutral-300 font-medium italic">&quot;{correction.essayTheme}&quot;</p>
          </div>
        </div>
        <Link href={backLink} className="group flex items-center gap-2 px-6 py-3 glass rounded-2xl text-sm font-bold hover:bg-white/5 transition-all text-neutral-400">
          <ArrowLeft size={16} /> {backText}
        </Link>
      </div>

      {/* Gráfico + Competências */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-[2.5rem] bg-neutral-900/40 border border-white/5 flex flex-col justify-center min-h-[400px]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Zap size={20} className="text-violet-400" /> Análise Visual
          </h3>
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={correction.scoreData}>
                <PolarGrid stroke="#444" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#999', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 200]} tick={false} axisLine={false} />
                <Radar name="Nota" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }} itemStyle={{ color: '#ddd' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] bg-neutral-900/40 border border-white/5 space-y-4">
          <h3 className="text-xl font-bold mb-6">Competências</h3>
          <div className="space-y-3">
            {correction.scoreData.map((s: any) => (
              <div key={s.subject} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${s.A >= 160 ? 'bg-emerald-500' : s.A >= 120 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <span className="text-neutral-400 font-bold uppercase text-sm">{s.subject}</span>
                </div>
                <span className="text-violet-400 font-black text-lg">{s.A} <span className="text-[10px] text-neutral-600 font-bold">pts</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Relatório */}
      <div className="glass rounded-[3rem] p-10 md:p-14 bg-neutral-900/40 border border-white/10 shadow-2xl space-y-2">
        <h3 className="text-2xl font-black text-white mb-8 border-b border-white/10 pb-4">Detalhamento Pedagógico</h3>
        {renderMarkdown(correction.result)}
      </div>

      {/* Botões */}
      <div className="flex flex-col md:flex-row justify-center gap-4">
        <button 
          onClick={handleDownloadPdf} 
          disabled={isGeneratingPdf}
          className="flex-1 p-5 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-neutral-300 disabled:opacity-50"
        >
          {isGeneratingPdf ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} className="text-violet-400" />}
          {isGeneratingPdf ? 'Gerando...' : 'Baixar Relatório PDF'}
        </button>
        <button className="flex-1 p-5 bg-violet-600 rounded-2xl font-bold hover:bg-violet-500 transition-all text-white flex items-center justify-center gap-3 shadow-lg shadow-violet-600/20">
          <CheckCircle2 size={20} /> Confirmar Recebimento
        </button>
      </div>
    </div>
  );
}
