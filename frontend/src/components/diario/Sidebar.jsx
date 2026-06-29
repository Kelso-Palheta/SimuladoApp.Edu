"use client";

import { useState, useRef } from 'react';
import { calcTotal, round2, somaMaxAtv, temNota } from '@/utils/diario/calculos';

const BIMESTRES = [1, 2, 3, 4];

const mediaTurma = (turma, bimestre) => {
  const b = turma.bimestres[String(bimestre)];
  if (!b) return null;
  const { atividades, notas, config } = b;
  const totais = turma.alunos
    .filter((al) => temNota(notas[al.id], atividades))
    .map((al) => {
      const nota = notas[al.id] || {};
      return calcTotal(nota.simulado, atividades, nota, config);
    });
  if (!totais.length) return null;
  return round2(totais.reduce((a, x) => a + x, 0) / totais.length);
};

const MediaBadge = ({ value }) => {
  if (value === null) return <span className="text-slate-400 text-xs font-mono">&mdash;</span>;
  const color = value >= 7 ? 'text-green-600' : value >= 5 ? 'text-blue-600' : 'text-red-600';
  return <span className={`font-mono text-xs font-semibold ${color}`}>{value.toFixed(2).replace('.', ',')}</span>;
};

export const Sidebar = ({
  turmas,
  turmaSelecionada,
  bimestreSelecionado,
  user,
  onSelectTurma,
  onSelectBimestre,
  onAddTurma,
  onRemoveTurma,
  onReorderTurmas,
  onLogout,
  onOpenProfile
}) => {
  const [novaTurma, setNovaTurma] = useState('');
  const fileInputRef = useRef(null);

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(turmas, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `backup-notas-${new Date().toISOString().slice(0, 10)}.json`);
      linkElement.click();
    } catch (err) {
      alert('Erro ao exportar backup: ' + err.message);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!Array.isArray(parsed)) throw new Error('O arquivo de backup deve ser uma lista de turmas.');
        const isValid = parsed.every(t => t.id && t.nome && t.alunos && t.bimestres);
        if (!isValid) throw new Error('Estrutura de turmas inválida no arquivo.');
        if (window.confirm('Atenção: Carregar este backup substituirá todas as turmas e notas atuais. Deseja continuar?')) {
          onReorderTurmas(parsed);
          alert('Backup importado com sucesso!');
        }
      } catch (err) {
        alert('Erro ao importar backup: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverIndex !== index) setDragOverIndex(index);
  };
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  const handleDrop = (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    const reordered = [...turmas];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, removed);
    onReorderTurmas(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const submit = () => {
    const nome = novaTurma.trim();
    if (!nome) return;
    onAddTurma(nome);
    setNovaTurma('');
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-700 to-violet-400 flex items-center justify-center text-white text-xs font-extrabold tracking-wider">
            N
          </div>
          <span className="font-semibold text-slate-900 tracking-tight text-sm">Gestão de Notas</span>
        </div>
      </div>

      {/* Bimestre selector */}
      <div className="px-4 py-4 border-b border-slate-200">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2.5 font-semibold">Bimestre</p>
        <div className="grid grid-cols-4 gap-1.5">
          {BIMESTRES.map((b) => (
            <button
              key={b}
              onClick={() => onSelectBimestre(b)}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all duration-300 border hover:scale-105 active:scale-95
                ${bimestreSelecionado === b
                  ? 'bg-violet-500 text-white border-violet-400/20'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 border-slate-200'}`}
            >
              {b}º
            </button>
          ))}
        </div>
      </div>

      {/* Turmas list */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2.5 px-1 font-semibold">Turmas</p>
        {turmas.map((turma, index) => {
          const media = mediaTurma(turma, bimestreSelecionado);
          const ativa = turmaSelecionada?.id === turma.id;
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={turma.id}
              className={`group relative transition-all duration-300 ${isDragging ? 'opacity-40' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={() => handleDrop(index)}
            >
              {isDragOver && !isDragging && (
                <div className={`absolute left-0 right-0 h-0.5 bg-violet-500 z-10 ${draggedIndex > index ? 'top-0' : 'bottom-0'}`} />
              )}
              <button
                onClick={() => onSelectTurma(turma)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-300 border hover:scale-[1.01] active:scale-[0.99]
                  ${ativa
                    ? 'bg-violet-50 border-l-4 border-l-violet-500 border-transparent'
                    : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-transparent'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity select-none font-mono text-xs w-3 text-center" title="Arrastar para reordenar">⠿</span>
                  <span className={`font-semibold text-sm ${ativa ? 'text-violet-600 font-bold' : 'text-slate-800 group-hover:text-slate-900'}`}>
                    {turma.nome}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">({turma.alunos.length})</span>
                </div>
                <MediaBadge value={media} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Backup */}
      <div className="px-3 py-3 border-t border-slate-200 flex gap-2">
        <button onClick={handleExport} className="flex-1 py-2 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 rounded-lg text-[10px] uppercase tracking-wider font-semibold text-slate-500 hover:text-violet-600 transition-all text-center">
          Exportar
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-2 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 rounded-lg text-[10px] uppercase tracking-wider font-semibold text-slate-500 hover:text-violet-600 transition-all text-center">
          Importar
        </button>
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </div>

      {/* Add turma */}
      <div className="px-3 py-4 border-t border-slate-200">
        <div className="flex gap-2">
          <input
            value={novaTurma}
            onChange={(e) => setNovaTurma(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Nova turma…"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-violet-400/50 transition-all"
          />
          <button
            onClick={submit}
            className="px-3.5 py-2 bg-violet-500 hover:bg-violet-400 hover:scale-[1.03] active:scale-[0.97] rounded-lg text-white text-sm font-medium transition-all"
          >
            +
          </button>
        </div>
      </div>

      {/* User */}
      {user && (
        <div className="px-3 py-3 border-t border-slate-200">
          <div className="flex items-center gap-2.5">
            <button onClick={onOpenProfile} className="flex flex-1 items-center gap-2.5 min-w-0 text-left hover:opacity-80 transition-opacity outline-none" title="Meu Perfil">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-violet-200 flex items-center justify-center text-violet-500 text-xs font-bold flex-shrink-0">
                  {user.displayName?.[0] || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">{user.displayName || 'Usuário'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </button>
            <button onClick={onLogout} className="text-slate-400 hover:text-red-500 text-xs transition-colors p-1 flex-shrink-0" title="Sair">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
