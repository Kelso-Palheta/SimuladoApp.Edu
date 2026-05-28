import React from 'react';
import { BookOpen, CheckCircle2, AlertTriangle, Info, Zap } from 'lucide-react';

export default function CriteriaPage() {
  const competencies = [
    {
      id: 'C1',
      title: 'Domínio da Norma Culta',
      description: 'Demonstrar domínio da modalidade escrita formal da língua portuguesa.',
      points: [
        'Ausência de erros gramaticais e de ortografia.',
        'Sintaxe fluida e complexa.',
        'Vocabulário variado e preciso.',
        'Respeito às regras de acentuação e pontuação.'
      ]
    },
    {
      id: 'C2',
      title: 'Compreensão do Tema',
      description: 'Compreender a proposta de redação e aplicar conceitos de várias áreas de conhecimento para desenvolver o tema.',
      points: [
        'Fidelidade total ao tema proposto.',
        'Uso de repertório sociocultural legitimado e pertinente.',
        'Desenvolvimento de texto dissertativo-argumentativo.',
        'Presença de tese clara e bem defendida.'
      ]
    },
    {
      id: 'C3',
      title: 'Seleção e Organização',
      description: 'Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos em defesa de um ponto de vista.',
      points: [
        'Projeto de texto evidente e estratégico.',
        'Argumentação consistente e autoral.',
        'Progressão temática lógica sem repetições.',
        'Conexão profunda entre argumentos e tese.'
      ]
    },
    {
      id: 'C4',
      title: 'Conhecimento Linguístico',
      description: 'Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação.',
      points: [
        'Uso diversificado de conectivos entre parágrafos.',
        'Coesão referencial e sequencial impecável.',
        'Ausência de repetições vocabulares excessivas.',
        'Articulação clara entre as partes do texto.'
      ]
    },
    {
      id: 'C5',
      title: 'Proposta de Intervenção',
      description: 'Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos.',
      points: [
        'Ação (O que fazer?)',
        'Agente (Quem vai fazer?)',
        'Meio/Modo (Como será feito?)',
        'Efeito (Qual o objetivo?)',
        'Detalhamento (Explicação adicional de um dos elementos).'
      ]
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-8 md:py-12 space-y-12">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-violet-500/10 rounded-2xl border border-violet-500/20 flex items-center justify-center">
          <BookOpen size={30} className="text-violet-400" />
        </div>
        <h1 className="text-4xl font-black text-white">Critérios Oficiais INEP</h1>
        <p className="text-neutral-400 max-w-2xl mx-auto font-medium">
          Entenda os pilares da avaliação do ENEM. Nosso sistema utiliza exatamente estes parâmetros para garantir a precisão da sua correção.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {competencies.map((comp) => (
          <div key={comp.id} className="glass p-8 rounded-[2.5rem] bg-neutral-900/40 border border-white/5 hover:border-violet-500/30 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-black text-violet-500/40 group-hover:text-violet-500 transition-colors">{comp.id}</span>
              <h3 className="text-xl font-bold text-white">{comp.title}</h3>
            </div>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed font-medium">{comp.description}</p>
            <div className="space-y-3">
              {comp.points.map((point, i) => (
                <div key={i} className="flex gap-3 text-sm text-neutral-300 items-start">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="glass p-10 rounded-[3rem] bg-violet-600/10 border border-violet-500/20 space-y-6">
        <h3 className="text-2xl font-black flex items-center gap-3">
          <AlertTriangle size={24} className="text-yellow-500" />
          Fatores de Nota Zero
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            'Fuga ao tema',
            'Texto com menos de 7 linhas',
            'Desrespeito aos direitos humanos',
            'Folha em branco',
            'Forma elementar de anulação',
            'Parte deliberadamente desconectada'
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-black/40 rounded-2xl border border-white/5 text-sm font-medium text-neutral-300">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8 bg-neutral-900/60 p-8 rounded-[2rem] border border-white/5">
        <div className="p-4 bg-violet-500/20 rounded-2xl">
          <Zap size={32} className="text-violet-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-lg font-bold">IA de Redação Treinada</h4>
          <p className="text-neutral-400 text-sm">
            Nossa inteligência artificial foi alimentada com milhares de redações nota 1000 e os manuais de correção de corretores sêniores do INEP (2024).
          </p>
        </div>
        <button className="whitespace-nowrap px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
          Ver Manual Completo <Info size={16} />
        </button>
      </div>
    </div>
  );
}
