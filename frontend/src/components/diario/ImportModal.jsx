"use client";

import { useState, useRef } from 'react';
import { importarXlsxOuCsv } from '@/utils/diario/importXlsx';
import { normalizeNome, cleanNome, titleCase } from '@/utils/diario/calculos';
import { importarViaIA } from '@/utils/diario/importIA';

const ACCEPT_IA = '.pdf,.jpg,.jpeg,.png,.webp';
const ACCEPT_XLSX = '.xlsx,.xls,.csv';
const ACCEPT_ALL = ACCEPT_XLSX + ',' + ACCEPT_IA;

export const ImportModal = ({ turma, onConfirm, onClose }) => {
  const [stage, setStage] = useState('drop');
  const [nomes, setNomes] = useState([]);
  const [erro, setErro] = useState('');
  const [dragging, setDragging] = useState(false);
  const [editNome, setEditNome] = useState(null);
  const inputRef = useRef();

  const existentes = new Set(turma.alunos.map((a) => normalizeNome(a.nome)));

  const processarArquivo = async (file) => {
    setStage('processing');
    setErro('');
    try {
      let nomes;
      const ext = file.name.split('.').pop().toLowerCase();
      if (['xlsx', 'xls', 'csv'].includes(ext)) {
        nomes = await importarXlsxOuCsv(file);
      } else {
        nomes = await importarViaIA(file);
      }
      const limpos = [...new Set(nomes.map(cleanNome).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, 'pt-BR')
      );
      setNomes(limpos);
      setStage('preview');
    } catch (e) {
      setErro(e.message);
      setStage('error');
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processarArquivo(file);
  };

  const onPick = (e) => {
    const file = e.target.files?.[0];
    if (file) processarArquivo(file);
  };

  const novos = nomes.filter((n) => !existentes.has(normalizeNome(n)));
  const duplicatas = nomes.filter((n) => existentes.has(normalizeNome(n)));

  const confirmar = () => {
    onConfirm(novos);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="font-semibold text-slate-900">Importar Alunos</h2>
            <p className="text-xs text-slate-400 mt-0.5">Turma {turma.nome}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none">×</button>
        </div>

        <div className="p-6">
          {(stage === 'drop' || stage === 'error') && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
                  ${dragging ? 'border-violet-500 bg-violet-50' : 'border-slate-300 hover:border-violet-400 hover:bg-slate-50'}`}
              >
                <div className="text-4xl mb-3">📂</div>
                <p className="text-sm text-slate-600 font-medium">Arraste ou clique para selecionar</p>
                <p className="text-xs text-slate-400 mt-1">.xlsx · .csv · .pdf · .jpg · .png · .webp</p>
                <p className="text-[10px] text-slate-500 mt-2">PDF/imagem usa extração por IA</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPT_ALL}
                  className="hidden"
                  onChange={onPick}
                />
              </div>
              {stage === 'error' && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  ⚠ {erro}
                </div>
              )}
            </>
          )}

          {stage === 'processing' && (
            <div className="py-16 flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
              <p className="text-sm text-slate-400">Processando arquivo…</p>
            </div>
          )}

          {stage === 'preview' && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-slate-600">
                  <strong className="text-green-600">{novos.length}</strong> novo{novos.length !== 1 && 's'}
                  {duplicatas.length > 0 && (
                    <>, <strong className="text-amber-500">{duplicatas.length}</strong> já exist{duplicatas.length !== 1 ? 'em' : 'e'}</>
                  )}
                </span>
                <button onClick={() => setStage('drop')} className="ml-auto text-xs text-slate-400 hover:text-slate-600">← trocar arquivo</button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                {nomes.map((nome, i) => {
                  const isDup = existentes.has(nome);
                  return (
                    <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${isDup ? 'opacity-40' : 'bg-slate-50'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDup ? 'bg-amber-400' : 'bg-green-400'}`} />
                      {editNome === i ? (
                        <input
                          autoFocus
                          className="flex-1 bg-transparent border-b border-violet-500 outline-none text-slate-900 font-mono text-xs"
                          defaultValue={nome}
                          onBlur={(e) => {
                            const novo = cleanNome(e.target.value);
                            if (novo) setNomes((prev) => { const n = [...prev]; n[i] = novo; return n; });
                            setEditNome(null);
                          }}
                          onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditNome(null); }}
                        />
                      ) : (
                        <span className="flex-1 font-mono text-xs text-slate-800">{titleCase(nome)}</span>
                      )}
                      {!isDup && (
                        <button onClick={() => setEditNome(i)} className="text-slate-400 hover:text-slate-600 text-xs">✎</button>
                      )}
                      <button onClick={() => setNomes((prev) => prev.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500 text-xs">×</button>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 text-sm transition-all">
                  Cancelar
                </button>
                <button
                  onClick={confirmar}
                  disabled={novos.length === 0}
                  className="flex-1 py-2 rounded-lg bg-violet-500 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
                >
                  Adicionar {novos.length} aluno{novos.length !== 1 && 's'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
