import React from 'react';
import Link from 'next/link';
import { User, GraduationCap, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center mb-16 space-y-4">
        <div className="mx-auto w-24 h-24 bg-violet-500/20 rounded-[2.5rem] border border-violet-500/30 flex items-center justify-center shadow-[0_0_80px_-20px_rgba(139,92,246,0.6)] animate-pulse">
          <Zap size={48} className="text-violet-400 fill-violet-400/20" />
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
          Redação Corrigida AI
        </h1>
        <p className="text-neutral-400 text-lg max-w-lg mx-auto font-medium">
          A plataforma definitiva de correção pedagógica baseada nos critérios oficiais do INEP.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Professor Card */}
        <Link href="/professor" className="group relative">
          <div className="absolute inset-0 bg-violet-600 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-10 transition-all duration-500" />
          <div className="relative glass p-10 rounded-[3rem] border border-white/5 group-hover:border-violet-500/30 transition-all duration-500 flex flex-col items-center text-center space-y-6 h-full">
            <div className="p-5 bg-white/5 rounded-3xl group-hover:scale-110 transition-transform duration-500">
              <User size={40} className="text-violet-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Sou Professor</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Acesse o painel para corrigir redações via foto ou texto e gerencie o desempenho da sua turma.
              </p>
            </div>
            <div className="mt-auto pt-4 text-violet-400 font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
              Acessar Painel <span>→</span>
            </div>
          </div>
        </Link>

        {/* Aluno Card */}
        <Link href="/aluno" className="group relative">
          <div className="absolute inset-0 bg-indigo-600 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-10 transition-all duration-500" />
          <div className="relative glass p-10 rounded-[3rem] border border-white/5 group-hover:border-indigo-500/30 transition-all duration-500 flex flex-col items-center text-center space-y-6 h-full">
            <div className="p-5 bg-white/5 rounded-3xl group-hover:scale-110 transition-transform duration-500">
              <GraduationCap size={40} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Sou Aluno</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Insira o código enviado pelo seu professor para visualizar sua análise detalhada e nota final.
              </p>
            </div>
            <div className="mt-auto pt-4 text-indigo-400 font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
              Ver Minha Redação <span>→</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
