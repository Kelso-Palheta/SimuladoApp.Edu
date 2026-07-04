"use client";

import { useState } from 'react';
import { TabelaNotas } from '@/components/diario/TabelaNotas';
import { ImportModal } from '@/components/diario/ImportModal';
import { MapaAnual } from '@/components/diario/MapaAnual';
import { calcTotal, fmt, round2, somaMaxAtv, temNota, statusColor } from '@/utils/diario/calculos';

const statsByBimestre = (turma, bimestre) => {
  const b = turma.bimestres[String(bimestre)];
  if (!b) return { aprovados: 0, recuperacao: 0, reprovados: 0, semNota: 0 };
  const { atividades, notas, config } = b;
  let aprovados = 0, naMedia = 0, abaixo = 0, semNota = 0;
  turma.alunos.forEach((al) => {
    const nota = notas[al.id];
    if (!temNota(nota, atividades)) { semNota++; return; }
    const t = calcTotal(nota.simulado, atividades, nota, config);
    const sc = statusColor(t, config);
    if (sc === 'good') aprovados++;
    else if (sc === 'warn') naMedia++;
    else abaixo++;
  });
  return { aprovados, naMedia, abaixo, semNota };
};

const StatChip = ({ label, value, color }) => (
  <div className={`flex flex-col items-center px-2 sm:px-5 py-0.5 sm:py-2.5 rounded-xl sm:rounded-2xl border transition-all duration-300 hover:scale-105 ${color}`}>
    <span className="font-bold text-base sm:text-xl font-mono tracking-tight tabular-nums">{value}</span>
    <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-wider opacity-75">{label}</span>
  </div>
);

export const TurmaView = ({
  turma, turmas, bimestre, user, onSetNota, onAddAtv, onRemoveAtv, onUpdateAtvMax,
  onAddAlunos, onRemoveAluno, onRemoveAlunos, onUpdateConfig, onSetRecuperacao,
  onClearAtividadesNota, onClearAtividadesTurma, onAddAlunoManual, onUpdateAluno, onRemoveTurma,
  onClearSimuladoNota, onClearSimuladoTurma
}) => {
  const [showImport, setShowImport] = useState(false);
  const [view, setView] = useState('bimestre');
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualNome, setManualNome] = useState('');
  const [manualData, setManualData] = useState('');

  const stats = statsByBimestre(turma, bimestre);

  const handleSetNota = (alunoId, campo, valor) => onSetNota(turma.id, bimestre, alunoId, campo, valor);
  const handleAddAtv = (nome, max) => onAddAtv(turma.id, bimestre, nome, max);
  const handleRemoveAtv = (atvId) => onRemoveAtv(turma.id, bimestre, atvId);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-3 sm:px-6 pt-3 sm:pt-5 pb-2 sm:pb-4 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">Turma {turma.nome}</h1>
              <span className="text-xs text-slate-400 font-mono">({turma.alunos.length} alunos)</span>
              {view === 'bimestre' && (
                <span className="px-2.5 py-0.5 bg-violet-50 border border-violet-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-violet-500">{bimestre}º Bimestre</span>
              )}
              {view === 'anual' && (
                <span className="px-2.5 py-0.5 bg-violet-50 border border-violet-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-violet-500">Mapa Anual</span>
              )}
            </div>

            {view === 'bimestre' && (
              <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 mt-3 lg:mt-2">
                <StatChip label="Acima da Média" value={stats.aprovados} color="border-green-200 text-green-600 bg-green-50" />
                <StatChip label="Na Média" value={stats.naMedia} color="border-blue-200 text-blue-600 bg-blue-50" />
                <StatChip label="Recuperação" value={stats.abaixo} color="border-red-200 text-red-600 bg-red-50" />
                {stats.semNota > 0 && <StatChip label="Sem nota" value={stats.semNota} color="border-slate-200 text-slate-500 bg-slate-50" />}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
            <button onClick={() => setView('bimestre')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border rounded-xl text-sm transition-all whitespace-nowrap
                ${view === 'bimestre' ? 'bg-violet-500 border-violet-400/40 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              <span className="font-semibold text-xs uppercase tracking-wider">Bimestre</span>
            </button>
            <button onClick={() => setView('anual')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border rounded-xl text-sm transition-all whitespace-nowrap
                ${view === 'anual' ? 'bg-violet-500 border-violet-400/40 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              <span className="font-semibold text-xs uppercase tracking-wider">Mapa Anual</span>
            </button>
            <button onClick={() => setShowImport(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 transition-all whitespace-nowrap">
              <span className="font-semibold text-xs uppercase tracking-wider">Importar Alunos</span>
            </button>
            {onRemoveTurma && (
              <button onClick={() => {
                if (window.confirm(`Tem certeza que deseja remover a turma ${turma.nome}?`)) onRemoveTurma(turma.id);
              }}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-sm text-red-500 transition-all whitespace-nowrap">
                <span className="font-semibold text-xs uppercase tracking-wider">Remover Turma</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-6">
        {turma.alunos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center max-w-md mx-auto">
            <div className="text-6xl opacity-20">📃</div>
            <p className="text-slate-400">Nenhum aluno cadastrado nesta turma.</p>
            {!showAddManual ? (
              <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button onClick={() => setShowImport(true)} className="px-5 py-2.5 bg-violet-500 hover:bg-violet-400 rounded-xl text-white text-sm font-medium transition-all">
                  Importar lista de alunos
                </button>
                <button onClick={() => setShowAddManual(true)} className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium transition-all">
                  Cadastrar manualmente
                </button>
              </div>
            ) : (
              <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mt-2 flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-slate-950 text-left">Cadastrar Aluno</h3>
                <div className="flex flex-col gap-2">
                  <input
                    value={manualNome}
                    onChange={(e) => setManualNome(e.target.value)}
                    placeholder="Nome completo do aluno"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-violet-400/50 transition-all"
                  />
                  <input
                    value={manualData}
                    onChange={(e) => setManualData(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="Data de nascimento (ddMM)"
                    maxLength={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-violet-400/50 transition-all font-mono text-center"
                  />
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  <button
                    onClick={() => {
                      setShowAddManual(false);
                      setManualNome('');
                      setManualData('');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 text-xs font-medium transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (!manualNome.trim()) return;
                      const birth = manualData.replace(/\D/g, '').slice(0, 4);
                      onAddAlunoManual(turma.id, {
                        nome: manualNome.trim(),
                        ...(birth.length === 4 ? { dataNascimento: birth } : {})
                      });
                      setManualNome('');
                      setManualData('');
                      setShowAddManual(false);
                    }}
                    disabled={!manualNome.trim()}
                    className="px-4 py-2 bg-violet-500 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white text-xs font-medium transition-all"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : view === 'anual' ? (
          <MapaAnual turma={turma} onSetRecuperacao={onSetRecuperacao} />
        ) : (
          <TabelaNotas
            turma={turma} bimestre={bimestre} onSetNota={handleSetNota}
            onAddAtv={handleAddAtv} onRemoveAtv={handleRemoveAtv}
            onRemoveAluno={onRemoveAluno} onRemoveAlunos={onRemoveAlunos}
            onAddAlunoManual={(dados) => onAddAlunoManual(turma.id, dados)}
            onUpdateAluno={onUpdateAluno}
            onUpdateConfig={(cfg) => onUpdateConfig(turma.id, bimestre, cfg)}
            onClearAtividadesNota={onClearAtividadesNota}
            onClearAtividadesTurma={onClearAtividadesTurma}
            onClearSimuladoNota={onClearSimuladoNota}
            onClearSimuladoTurma={onClearSimuladoTurma}
          />
        )}
      </div>

      {showImport && (
        <ImportModal turma={turma} onConfirm={(nomes) => onAddAlunos(turma.id, nomes)} onClose={() => setShowImport(false)} />
      )}
    </div>
  );
};
