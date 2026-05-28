'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Image as ImageIcon, 
  Loader2,
  CheckCircle2,
  Download,
  ShieldCheck,
  Zap,
  Copy,
  ExternalLink,
  Edit3,
  Search,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
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

const AnimatedScore = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  React.useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    let totalDuration = 1500;
    let incrementTime = (totalDuration / (end || 1)) * 2;
    let timer = setInterval(() => {
      start += 5;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <div className="text-7xl font-black bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent drop-shadow-2xl">
      {displayValue}
    </div>
  );
};

type AppStep = 'input' | 'review' | 'result';

export default function ProfessorPage() {
  const [step, setStep] = useState<AppStep>('input');
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [essayTheme, setEssayTheme] = useState('');
  const [depth, setDepth] = useState<'basic' | 'analyzed' | 'deep'>('analyzed');
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>(['C1', 'C2', 'C3', 'C4', 'C5']);
  
  const [text, setText] = useState(''); // Texto final para correção
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState('image/jpeg');
  
  const [result, setResult] = useState<string | null>(null);
  const [scoreData, setScoreData] = useState<any[] | null>(null);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [correctionId, setCorrectionId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleCompetency = (c: string) => {
    setSelectedCompetencies(prev => 
      prev.includes(c) ? prev.filter(item => item !== c) : [...prev, c]
    );
  };

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleReset = () => {
    setStep('input');
    setResult(null);
    setScoreData(null);
    setTotalScore(0);
    setCorrectionId(null);
    setText('');
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Detecta ?new=1 na URL e reseta o estado
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      handleReset();
      router.replace('/professor');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (file) {
      setIsConverting(true);
      setMediaType(file.type);
      const isHeic = file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic';
      if (isHeic) {
        try {
          const heic2any = (await import('heic2any')).default;
          const resultBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.6 });
          const finalBlob = Array.isArray(resultBlob) ? resultBlob[0] : resultBlob;
          file = new File([finalBlob], file.name.replace(/\.(heic|HEIC)$/i, '.jpg'), { type: 'image/jpeg' });
          setMediaType('image/jpeg');
        } catch (err) {
          alert("Erro ao converter HEIC.");
          setIsConverting(false);
          return;
        }
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64((reader.result as string).split(',')[1]);
        setIsConverting(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Passo 1: Extração (apenas se for imagem)
  const handleExtractText = async () => {
    if (activeTab === 'text') {
      setStep('review');
      return;
    }
    if (!imageBase64) return;
    
    setIsExtracting(true);
    try {
      const res = await fetch('/api/extrair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mediaType })
      });
      const data = await res.json();
      if (data.text) {
        setText(data.text);
        setStep('review');
      } else {
        alert(data.error || 'Erro ao extrair texto');
      }
    } catch (e) {
      alert('Erro de conexão na extração');
    } finally {
      setIsExtracting(false);
    }
  };

  // Passo 2: Avaliação Final
  const handleAvaliar = async () => {
    if (!text) return;
    setIsLoading(true);
    // Obter userId do localStorage
    let userId = undefined;
    try {
      const userJson = localStorage.getItem('prof_user');
      if (userJson) {
        const user = JSON.parse(userJson);
        userId = user.id;
      }
    } catch (e) {}

    try {
      const res = await fetch('/api/corrigir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          studentName,
          studentClass,
          essayTheme,
          depth,
          competencies: selectedCompetencies.join(', '),
          userId
        })
      });
      const data = await res.json();
      if (data.id) {
        setResult(data.result);
        setCorrectionId(data.id);
        
        const extractScore = (fullText: string) => {
          const jsonMatch = fullText.match(/```json[\s\S]*?(\{[\s\S]*?\})[\s\S]*?```/) || fullText.match(/(\{[\s]*?"c1"[\s\S]*?\})/);
          if (jsonMatch && jsonMatch[1]) {
            const obj = JSON.parse(jsonMatch[1].trim());
            const c1 = Number(obj.c1) || 0;
            const c2 = Number(obj.c2) || 0;
            const c3 = Number(obj.c3) || 0;
            const c4 = Number(obj.c4) || 0;
            const c5 = Number(obj.c5) || 0;
            setTotalScore(Number(obj.total) || (c1+c2+c3+c4+c5));
            return [
              { subject: 'C1', A: c1, fullMark: 200 },
              { subject: 'C2', A: c2, fullMark: 200 },
              { subject: 'C3', A: c3, fullMark: 200 },
              { subject: 'C4', A: c4, fullMark: 200 },
              { subject: 'C5', A: c5, fullMark: 200 },
            ];
          }
          return null;
        };
        
        const scores = extractScore(data.result);
        if (scores) {
          setScoreData(scores);
          setStep('result');
        }
      } else {
        alert(data.error || 'Erro ao processar correção');
      }
    } catch (error) {
      alert('Erro de conexão na análise');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    const clean = text.replace(/```json[\s\S]*?```/g, '')
                      .replace(/\{[\s]*?"c1"[\s\S]*?\}/g, '')
                      .replace(/^[| \-:]+[| \-:]+$/gm, '')
                      .replace(/\|/g, ' ')
                      .trim();
    const lines = clean.split('\n');
    return lines.map((line, i) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return <div key={i} className="h-3" />;
      if (/^###\s/.test(trimmedLine)) return <h3 key={i} className="text-lg font-bold text-violet-400 mt-6 mb-2 pb-1 border-b border-violet-500/20">{trimmedLine.replace(/^###\s/, '')}</h3>;
      if (/^##\s/.test(trimmedLine)) return <h2 key={i} className="text-xl font-extrabold text-white mt-8 mb-4 tracking-tight">{trimmedLine.replace(/^##\s/, '')}</h2>;
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const rendered = parts.map((part, j) => {
        if (/^\*\*.*\*\*$/.test(part)) return <strong key={j} className="text-violet-200 font-bold">{part.slice(2, -2)}</strong>;
        return part;
      });
      if (/^[-*•▸]\s/.test(trimmedLine)) return (
        <div key={i} className="flex gap-3 items-start py-1 transition-all hover:bg-white/5 rounded-lg px-2 -ml-2">
          <span className="text-violet-500 mt-1 shrink-0">●</span>
          <p className="text-neutral-300 text-[15px] leading-relaxed font-medium">{rendered.map((r, k) => typeof r === 'string' ? r.replace(/^[-*•▸]\s?/, '') : r)}</p>
        </div>
      );
      return <p key={i} className="text-neutral-300 text-[15px] leading-relaxed py-1 px-1 font-medium">{rendered}</p>;
    });
  };

  const isHeaderValid = studentName.length > 2 && studentClass.length > 0 && essayTheme.length > 3;

  return (
    <div className="w-full flex flex-col items-center">
      <AnimatePresence mode='wait'>
        {step === 'input' && (
          <motion.div 
            key="input-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-3xl space-y-8 py-8"
          >
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-violet-500/20 rounded-3xl border border-violet-500/30 flex items-center justify-center shadow-[0_0_50px_-12px_rgba(139,92,246,0.5)]">
                <Zap size={40} className="text-violet-400" />
              </div>
              <h2 className="text-4xl font-bold tracking-tight">Nova Correção</h2>
              <p className="text-neutral-400 text-sm">Passo 1: Identificação e captura da redação.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-2">Nome do Aluno</label>
                <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Ex: João Silva" className="w-full p-4 bg-neutral-900 border border-white/5 rounded-2xl focus:border-violet-500/50 outline-none transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-2">Turma</label>
                <input type="text" value={studentClass} onChange={(e) => setStudentClass(e.target.value)} placeholder="Ex: 3º Ano B" className="w-full p-4 bg-neutral-900 border border-white/5 rounded-2xl focus:border-violet-500/50 outline-none transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-2">Tema</label>
                <input type="text" value={essayTheme} onChange={(e) => setEssayTheme(e.target.value)} placeholder="Título do tema..." className="w-full p-4 bg-neutral-900 border border-white/5 rounded-2xl focus:border-violet-500/50 outline-none transition-all text-sm" />
              </div>
            </div>

            <div className={`transition-all duration-700 relative ${!isHeaderValid ? 'grayscale opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <div className="glass rounded-[2rem] p-3 border border-white/10 shadow-2xl backdrop-blur-3xl">
                <div className="flex items-center border-b border-white/5 pb-2 mb-2 px-4 gap-2">
                  <button onClick={() => setActiveTab('upload')} className={`px-4 py-2 text-sm font-semibold transition-all rounded-full ${activeTab === 'upload' ? 'bg-violet-500/20 text-violet-400' : 'text-neutral-500 hover:text-neutral-300'}`}>Foto / Arquivo</button>
                  <button onClick={() => setActiveTab('text')} className={`px-4 py-2 text-sm font-semibold transition-all rounded-full ${activeTab === 'text' ? 'bg-violet-500/20 text-violet-400' : 'text-neutral-500 hover:text-neutral-300'}`}>Texto Escrito</button>
                </div>
                <div onClick={() => activeTab === 'upload' && !isConverting && fileInputRef.current?.click()} className="p-6 rounded-2xl bg-neutral-900/50 min-h-[200px] flex items-center justify-center border border-dashed border-white/10 group hover:border-violet-500/30 transition-all cursor-pointer overflow-hidden">
                  {activeTab === 'upload' ? (
                    <div className="text-center space-y-3">
                      {isConverting ? <div className="flex flex-col items-center gap-2"><Loader2 size={48} className="text-violet-400 animate-spin" /><p className="text-sm font-medium text-violet-400">Convertendo...</p></div> : imageBase64 ? <div className="flex flex-col items-center gap-2"><CheckCircle2 size={48} className="text-emerald-400" /><p className="text-sm font-medium text-emerald-400">Imagem Selecionada!</p><button onClick={(e) => {e.stopPropagation(); handleReset()}} className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:underline mt-2">Remover</button></div> : <><ImageIcon className="text-neutral-400 group-hover:text-violet-400" size={32} /><p className="text-neutral-400 font-medium">Clique para selecionar imagem</p><p className="text-[10px] text-neutral-600 uppercase font-bold">Resolução ideal: 300dpi</p></>}
                      <input ref={fileInputRef} type="file" hidden accept="image/*,.heic" onChange={handleFileChange} />
                    </div>
                  ) : <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Cole o texto original aqui..." className="w-full h-48 bg-transparent outline-none resize-none text-neutral-300 placeholder:text-neutral-600 font-medium leading-relaxed" />}
                </div>
                <div className="flex justify-between items-center mt-4 px-2">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Extração Segura Garantida</span>
                  <button onClick={handleExtractText} disabled={isExtracting || (activeTab === 'upload' && !imageBase64) || (activeTab === 'text' && !text) || isConverting} className="p-3 px-8 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 transition-all rounded-2xl text-white font-bold flex items-center gap-2 shadow-[0_0_30px_-10px_rgba(139,92,246,1)]">
                    {isExtracting ? <Loader2 className="animate-spin" size={18} /> : activeTab === 'upload' ? <Search size={18} /> : <ArrowRight size={18} />}
                    {isExtracting ? 'Extraindo...' : activeTab === 'upload' ? 'Extrair Texto' : 'Continuar'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div 
            key="review-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-4xl space-y-8 py-8"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-4">
                <button onClick={() => setStep('input')} className="p-2 hover:bg-white/5 rounded-xl transition-all"><RefreshCw size={20} className="text-neutral-500" /></button>
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2"><Edit3 size={24} className="text-violet-400" /> Revisão do Texto</h2>
                  <p className="text-neutral-500 text-sm">Ajuste o texto extraído para corrigir possíveis erros de leitura da IA.</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-none">Aluno</p>
                <p className="text-sm font-bold text-violet-400">{studentName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass p-5 rounded-[2rem] border border-white/10 space-y-4">
                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Profundidade da Análise</label>
                <div className="flex bg-neutral-950 p-1 rounded-2xl border border-white/5">
                  {['basic', 'analyzed', 'deep'].map((lvl) => (
                    <button key={lvl} onClick={() => setDepth(lvl as any)} className={`flex-1 py-3 text-xs font-bold rounded-xl capitalize transition-all ${depth === lvl ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-neutral-500 hover:text-neutral-300'}`}>{lvl === 'basic' ? 'Normal' : lvl === 'analyzed' ? 'Crítica' : 'Master'}</button>
                  ))}
                </div>
              </div>
              <div className="glass p-5 rounded-[2rem] border border-white/10 space-y-4">
                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Competências Ativas</label>
                <div className="flex justify-between gap-1">
                  {['C1', 'C2', 'C3', 'C4', 'C5'].map((comp) => (
                    <button key={comp} onClick={() => toggleCompetency(comp)} className={`flex-1 py-2 rounded-xl border text-[10px] font-black transition-all flex items-center justify-center ${selectedCompetencies.includes(comp) ? 'bg-violet-500/20 border-violet-500 text-violet-400 shadow-[0_0_15px_-5px_rgba(139,92,246,1)]' : 'border-white/5 text-neutral-600 hover:border-white/20'}`}>{comp}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass rounded-[2rem] p-6 border border-white/10 bg-neutral-900/40 relative">
              <div className="absolute top-4 right-6 flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-500 uppercase animate-pulse">Ambiente de Edição Ativo</span>
              </div>
              <textarea 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                className="w-full h-80 bg-transparent outline-none resize-none text-neutral-200 font-medium leading-[1.8] text-lg scrollbar-thin scrollbar-thumb-white/10"
                placeholder="O texto extraído aparecerá aqui..."
              />
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">{text.length} caracteres extraídos</p>
                <button onClick={handleAvaliar} disabled={isLoading || !text} className="p-4 px-10 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all rounded-2xl text-white font-black flex items-center gap-2 shadow-[0_0_40px_-5px_rgba(16,185,129,0.5)]">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                  {isLoading ? 'Gerando Relatório...' : 'Finalizar e Avaliar'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div 
            key="result-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl py-12 space-y-8"
          >
            <div className="bg-violet-500/10 border border-violet-500/20 p-6 rounded-3xl flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-violet-400 mb-1">ID de Acesso do Aluno</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-mono font-black text-white">{correctionId}</span>
                  <button onClick={() => {navigator.clipboard.writeText(correctionId || ''); alert('ID Copiado!')}} className="p-2 hover:bg-white/10 rounded-lg text-neutral-400 transition-all"><Copy size={18} /></button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500 mb-2">Compartilhe este código com o aluno.</p>
                <Link href={`/aluno/${correctionId}`} target="_blank" className="text-xs font-bold text-violet-400 hover:underline flex items-center gap-1 justify-end">Ver como aluno <ExternalLink size={12} /></Link>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-violet-600 blur-2xl opacity-20 group-hover:opacity-40 transition-all"></div>
                  <AnimatedScore value={totalScore} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{studentName}</h2>
                  <p className="text-neutral-400">Turma: {studentClass} | Tema: {essayTheme}</p>
                </div>
              </div>
              <button onClick={handleReset} className="px-6 py-2 glass rounded-full text-sm font-bold hover:bg-white/5">Nova Redação</button>
            </div>
            
            {scoreData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={scoreData}>
                      <PolarGrid stroke="#444" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#999', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 200]} tick={false} axisLine={false} />
                      <Radar name="Nota" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                      <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }} itemStyle={{ color: '#ddd' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Resumo por Competência</h3>
                  <div className="space-y-2">
                    {scoreData.map((s) => (
                      <div key={s.subject} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-neutral-400 text-sm font-medium">{s.subject}</span>
                        <span className="text-violet-400 font-bold">{s.A} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="glass rounded-3xl p-8 bg-neutral-900/40 border border-white/5 space-y-1">
              {result && renderMarkdown(result)}
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={() => generatePDF(result || '', studentName, studentClass, essayTheme, scoreData)} className="flex-1 p-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"><Download size={18} />Exportar PDF</button>
              <button className="flex-1 p-4 bg-violet-600 rounded-2xl font-bold hover:bg-violet-400 transition-all shadow-lg shadow-violet-500/20">Compartilhar Link</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
