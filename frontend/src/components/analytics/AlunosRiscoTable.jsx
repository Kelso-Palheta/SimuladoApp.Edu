'use client';

import { AlertTriangle, ShieldAlert, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export function AlunosRiscoTable({ alunos = [], onSelectAluno }) {
  const temAlunos = alunos.length > 0;

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#f60c49]">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#101942]">Radar de Atenção Pedagógica</h4>
            <p className="text-xs text-slate-500 font-medium">
              Estudantes com rendimento abaixo do esperado necessitando de intervenção
            </p>
          </div>
        </div>

        {temAlunos && (
          <span className="text-xs font-bold px-3 py-1 bg-rose-100 text-[#f60c49] rounded-full border border-rose-200">
            {alunos.length} {alunos.length === 1 ? 'aluno em alerta' : 'alunos em alerta'}
          </span>
        )}
      </div>

      {!temAlunos ? (
        <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
          <CheckCircle2 size={36} className="text-emerald-500" />
          <p className="font-semibold text-slate-700">Nenhum aluno em situação de risco detectado!</p>
          <p className="text-xs text-slate-400">Todos os estudantes avaliados estão com notas adequadas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Estudante</th>
                <th className="pb-3">Turma</th>
                <th className="pb-3 text-center">Bimestre</th>
                <th className="pb-3 text-center">Nota Obtida</th>
                <th className="pb-3">Nível de Risco</th>
                <th className="pb-3 text-right pr-2">Ação Sugerida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alunos.map((aluno, index) => {
                const isCritico = aluno.classificacao === 'critico';
                return (
                  <tr
                    key={`${aluno.alunoId}-${aluno.turmaId}-${index}`}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 pl-2 font-bold text-[#101942] flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isCritico
                            ? 'bg-rose-100 text-[#f60c49]'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {aluno.nome.charAt(0)}
                      </div>
                      <span className="truncate max-w-[200px]">{aluno.nome}</span>
                    </td>

                    <td className="py-3.5 text-slate-600 font-medium">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">
                        {aluno.turmaNome}
                      </span>
                    </td>

                    <td className="py-3.5 text-center text-slate-600 font-semibold text-xs">
                      {aluno.bimestre}º Bim
                    </td>

                    <td className="py-3.5 text-center">
                      <span
                        className={`font-extrabold text-sm px-2.5 py-1 rounded-lg ${
                          isCritico
                            ? 'bg-rose-50 text-[#f60c49] border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {aluno.nota.toFixed(2).replace('.', ',')} pts
                      </span>
                    </td>

                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                          isCritico
                            ? 'bg-rose-500/10 text-[#f60c49]'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}
                      >
                        <AlertTriangle size={12} />
                        {isCritico ? 'Risco Crítico (< 4.0)' : 'Recuperação (4.0 - 4.9)'}
                      </span>
                    </td>

                    <td className="py-3.5 text-right pr-2">
                      <span className="text-xs font-medium text-slate-500">
                        {isCritico ? 'Atividade de Reforço + Tutoria' : 'Prova de Recuperação'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
