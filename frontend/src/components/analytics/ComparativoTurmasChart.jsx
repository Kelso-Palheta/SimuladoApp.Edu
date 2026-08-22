'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#101942] text-white p-3 rounded-xl shadow-xl border border-white/10 text-xs space-y-1">
        <p className="font-bold text-sm text-white">{data.nomeCompleto}</p>
        <p className="text-slate-300 font-medium">{data.disciplina || 'Geral'}</p>
        <div className="pt-1 space-y-0.5 border-t border-white/10">
          <p className="text-emerald-400 font-semibold">
            Média da Turma: {data.media !== null ? `${data.media.toFixed(2).replace('.', ',')} pts` : 'Sem dados'}
          </p>
          <p className="text-blue-300">
            Aprovação: {data.taxaAprovacao}%
          </p>
          <p className="text-slate-400">
            Alunos avaliados: {data.avaliados} de {data.totalAlunos}
          </p>
        </div>
      </div>
    );
  }
  return null;
}

export function ComparativoTurmasChart({ turmasMetricas = [] }) {
  const chartData = turmasMetricas.map((tm) => ({
    id: tm.turmaId,
    nome: tm.turmaNome?.length > 14 ? `${tm.turmaNome.slice(0, 12)}...` : tm.turmaNome,
    nomeCompleto: tm.turmaNome,
    disciplina: tm.disciplina,
    media: tm.mediaTurma,
    taxaAprovacao: tm.taxaAprovacao,
    avaliados: tm.totalAvaliados,
    totalAlunos: tm.totalAlunos,
  }));

  const temDados = chartData.some((d) => d.media !== null);

  const getCorBarra = (media) => {
    if (media === null) return '#94a3b8';
    if (media >= 7.0) return '#10b981';
    if (media >= 5.0) return '#3b82f6';
    if (media >= 4.0) return '#f59e0b';
    return '#f60c49';
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-base font-bold text-[#101942]">Comparativo entre Turmas</h4>
          <p className="text-xs text-slate-500 font-medium">
            Média de notas obtidas por turma no período
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> ≥ 7.0
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> ≥ 5.0
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f60c49]" /> &lt; 4.0
          </span>
        </div>
      </div>

      {!temDados ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            📊
          </div>
          <span>Sem notas lançadas nas turmas</span>
        </div>
      ) : (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="nome"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="media" radius={[8, 8, 0, 0]} maxBarSize={40}>
                {chartData.map((entry) => (
                  <Cell key={entry.id} fill={getCorBarra(entry.media)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
