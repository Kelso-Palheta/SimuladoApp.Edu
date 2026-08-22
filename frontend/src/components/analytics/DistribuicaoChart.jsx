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

const CORES_FAIXAS = {
  excelente: '#10b981', // Verde
  aprovado: '#3b82f6',  // Azul
  recuperacao: '#f59e0b', // Âmbar
  critico: '#f60c49',   // Rosa/Vermelho
};

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#101942] text-white p-3 rounded-xl shadow-xl border border-white/10 text-xs space-y-1">
        <p className="font-bold text-sm text-white">{data.faixaCompleta}</p>
        <p className="text-white font-semibold">
          Quantidade: <span className="text-emerald-400">{data.quantidade}</span> {data.quantidade === 1 ? 'aluno' : 'alunos'}
        </p>
        <p className="text-slate-300">
          Percentual: {data.percentual}% do total avaliado
        </p>
      </div>
    );
  }
  return null;
}

export function DistribuicaoChart({
  distribuicao = { excelente: 0, aprovado: 0, recuperacao: 0, critico: 0, total: 0 },
}) {
  const total = distribuicao.total || 0;

  const data = [
    {
      faixa: 'Excelente (≥ 8.0)',
      faixaCompleta: 'Excelente (Nota 8.0 a 10.0)',
      chave: 'excelente',
      quantidade: distribuicao.excelente || 0,
      percentual: total > 0 ? Math.round(((distribuicao.excelente || 0) / total) * 100) : 0,
    },
    {
      faixa: 'Adequado (5.0 - 7.9)',
      faixaCompleta: 'Adequado / Aprovado (Nota 5.0 a 7.9)',
      chave: 'aprovado',
      quantidade: distribuicao.aprovado || 0,
      percentual: total > 0 ? Math.round(((distribuicao.aprovado || 0) / total) * 100) : 0,
    },
    {
      faixa: 'Atenção (4.0 - 4.9)',
      faixaCompleta: 'Recuperação / Atenção (Nota 4.0 a 4.9)',
      chave: 'recuperacao',
      quantidade: distribuicao.recuperacao || 0,
      percentual: total > 0 ? Math.round(((distribuicao.recuperacao || 0) / total) * 100) : 0,
    },
    {
      faixa: 'Crítico (< 4.0)',
      faixaCompleta: 'Crítico / Alto Risco (Nota < 4.0)',
      chave: 'critico',
      quantidade: distribuicao.critico || 0,
      percentual: total > 0 ? Math.round(((distribuicao.critico || 0) / total) * 100) : 0,
    },
  ];

  const temDados = total > 0;

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-base font-bold text-[#101942]">Distribuição por Faixas de Nota</h4>
          <p className="text-xs text-slate-500 font-medium">
            Classificação pedagógica dos alunos avaliados
          </p>
        </div>
        {temDados && (
          <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
            {total} {total === 1 ? 'aluno' : 'alunos'}
          </span>
        )}
      </div>

      {!temDados ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            📊
          </div>
          <span>Sem registros de notas no período selecionado</span>
        </div>
      ) : (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="faixa"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                allowDecimals={false}
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="quantidade" radius={[8, 8, 0, 0]} maxBarSize={48}>
                {data.map((entry) => (
                  <Cell key={entry.chave} fill={CORES_FAIXAS[entry.chave]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
