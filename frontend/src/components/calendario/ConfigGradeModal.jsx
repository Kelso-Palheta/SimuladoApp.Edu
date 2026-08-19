import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export function ConfigGradeModal({ isOpen, onClose, onSave, turmaSelecionada, initialGrade }) {
  const [dataInicio, setDataInicio] = useState(initialGrade?.dataInicioPeriodo || '');
  const [dataFim, setDataFim] = useState(initialGrade?.dataFimPeriodo || '');
  const [diasSemana, setDiasSemana] = useState(initialGrade?.diasSemana || []);

  const [novoDia, setNovoDia] = useState(1); // 1 = Seg
  const [novoInicio, setNovoInicio] = useState('07:30');
  const [novoFim, setNovoFim] = useState('09:10');
  const [novaQtd, setNovaQtd] = useState(2);

  if (!isOpen) return null;

  const diasNomes = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  const handleAddDia = () => {
    setDiasSemana([...diasSemana, {
      diaSemana: Number(novoDia),
      horarioInicio: novoInicio,
      horarioFim: novoFim,
      quantidadeAulas: Number(novaQtd)
    }]);
  };

  const handleRemoveDia = (index) => {
    setDiasSemana(diasSemana.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!dataInicio || !dataFim || diasSemana.length === 0) {
      alert("Preencha o período letivo e adicione ao menos um dia na grade.");
      return;
    }
    
    onSave({
      dataInicioPeriodo: dataInicio,
      dataFimPeriodo: dataFim,
      diasSemana
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">
            Configurar Grade Horária
            {turmaSelecionada && <span className="block text-sm font-normal text-gray-500">Turma: {turmaSelecionada.name}</span>}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Período Letivo */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Período Letivo</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Data de Início</label>
                <input 
                  type="date" 
                  value={dataInicio} 
                  onChange={e => setDataInicio(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm text-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Data de Término</label>
                <input 
                  type="date" 
                  value={dataFim} 
                  onChange={e => setDataFim(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm text-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" 
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Adicionar Dia */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Rotina Semanal</h3>
            
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
              <div className="grid grid-cols-5 gap-3 items-end">
                <div className="col-span-2">
                  <label className="block text-xs text-indigo-800 mb-1 font-medium">Dia da Semana</label>
                  <select 
                    value={novoDia} 
                    onChange={e => setNovoDia(e.target.value)}
                    className="w-full border-indigo-200 rounded-md text-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    {diasNomes.map((nome, i) => (
                      <option key={i} value={i}>{nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-indigo-800 mb-1 font-medium">Início</label>
                  <input type="time" value={novoInicio} onChange={e => setNovoInicio(e.target.value)} className="w-full border-indigo-200 rounded-md text-sm text-gray-900 focus:ring-indigo-500 bg-white" />
                </div>
                <div>
                  <label className="block text-xs text-indigo-800 mb-1 font-medium">Fim</label>
                  <input type="time" value={novoFim} onChange={e => setNovoFim(e.target.value)} className="w-full border-indigo-200 rounded-md text-sm text-gray-900 focus:ring-indigo-500 bg-white" />
                </div>
                <div>
                  <label className="block text-xs text-indigo-800 mb-1 font-medium">Qtd Aulas</label>
                  <input type="number" min="1" max="10" value={novaQtd} onChange={e => setNovaQtd(e.target.value)} className="w-full border-indigo-200 rounded-md text-sm text-gray-900 focus:ring-indigo-500 bg-white" />
                </div>
              </div>
              <button 
                onClick={handleAddDia}
                className="mt-3 flex items-center justify-center w-full py-2 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-200 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" /> Adicionar à Grade
              </button>
            </div>

            {/* Lista de Dias Adicionados */}
            {diasSemana.length > 0 ? (
              <div className="space-y-2">
                {diasSemana.map((dia, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md shadow-sm">
                    <div>
                      <span className="font-semibold text-gray-800">{diasNomes[dia.diaSemana]}</span>
                      <span className="text-gray-500 text-sm ml-2">{dia.horarioInicio} às {dia.horarioFim}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium">
                        {dia.quantidadeAulas} aula(s)
                      </span>
                      <button onClick={() => handleRemoveDia(index)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Nenhum dia configurado na grade ainda.</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50 space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Salvar e Gerar Aulas
          </button>
        </div>
      </div>
    </div>
  );
}
